#!/usr/bin/env bash
# Deploy HYghLights -- and nothing else on that server.
#
# Ported from beyondlimits/scripts/deploy.sh. Same safety properties, in the
# same order of importance:
#   1. Refuses to run with uncommitted changes or unpushed commits, so what is
#      live can always be traced back to a commit on GitHub.
#   2. Snapshots code + BOTH databases before touching anything.
#   3. rsync is scoped to /var/www/hyghlights and never deletes .env.
#   4. Builds BEFORE restarting, so a broken build never takes the site down.
#   5. Restarts only the `hyghlights` pm2 process. The others are untouched.
#   6. Smoke-tests every domain afterwards and reports regressions.
#
#   scripts/deploy.sh              # full deploy
#   scripts/deploy.sh --dry-run    # show what would transfer, change nothing
#   scripts/deploy.sh --rollback   # restore the most recent snapshot
#
# WHY BOTH DATABASES: HYghLights owns `hyghlights`, but src/lib/identity.ts
# writes to the "User" table in `beyondlimits` — that is the shared account
# store behind single sign-on. createIdentity() inserts rows there and
# setIdentityPassword() rewrites them. A bad HYghLights deploy can therefore
# damage Beyond Limits' accounts, so a HYghLights snapshot that covered only
# its own database would not be a snapshot you could actually recover from.

set -uo pipefail
cd "$(dirname "$0")/.."

HOST=r0cketship
REMOTE=/var/www/hyghlights
APP=hyghlights
TS=$(date +%Y%m%d-%H%M%S)
SNAP="/root/backups/hyghlights/$TS"

die() { echo "ERROR: $*" >&2; exit 1; }
say() { echo; echo "=== $* ==="; }

# ---------------------------------------------------------------- rollback
if [ "${1:-}" = "--rollback" ]; then
  say "rolling back to the most recent snapshot"
  ssh $HOST "set -e
    B=\$(readlink -f /root/backups/$APP/latest)
    echo \"restoring from \$B\"
    [ -f \"\$B/code.tar.gz\" ] || { echo 'no snapshot found'; exit 1; }
    cp $REMOTE/.env /tmp/.env.hy.keep
    rm -rf $REMOTE.broken && mv $REMOTE $REMOTE.broken
    mkdir -p $REMOTE && tar xzf \"\$B/code.tar.gz\" -C /var/www
    cp /tmp/.env.hy.keep $REMOTE/.env
    # the snapshot excludes node_modules; bring it back rather than re-install
    cp -r $REMOTE.broken/node_modules $REMOTE/ 2>/dev/null || true
    cd $REMOTE && npm ci && npm run build && pm2 restart $APP --update-env
    echo 'rolled back'"
  ./scripts/smoke.sh compare
  exit $?
fi

DRY=""
[ "${1:-}" = "--dry-run" ] && DRY="--dry-run"

# ------------------------------------------------------- preflight: git clean
say "preflight"
[ -z "$(git status --porcelain)" ] || die "uncommitted changes. Commit them first so live code is traceable."
git fetch -q origin
AHEAD=$(git rev-list --count origin/main..HEAD)
[ "$AHEAD" = "0" ] || die "$AHEAD unpushed commit(s). Push first: git push origin main"
echo "  clean tree, in sync with origin/main at $(git rev-parse --short HEAD)"

# make sure it builds locally before we touch the server at all
say "local build check"
npm run build > /tmp/hy-build.log 2>&1 || { tail -30 /tmp/hy-build.log; die "local build failed - nothing was deployed"; }
echo "  local build OK"

# ------------------------------------------------------------ baseline first
say "baseline: all sites before deploy"
./scripts/smoke.sh baseline | tail -4 || die "could not capture a baseline - refusing to deploy blind"

# ------------------------------------------------------------------ snapshot
if [ -z "$DRY" ]; then
  say "snapshot -> $SNAP"
  ssh $HOST "set -e; mkdir -p $SNAP
    tar czf $SNAP/code.tar.gz --exclude=node_modules --exclude=.next --exclude=.git -C /var/www $APP
    sudo -u postgres pg_dump -Fc hyghlights   > $SNAP/hyghlights.dump
    sudo -u postgres pg_dump -Fc beyondlimits > $SNAP/beyondlimits.dump
    cp $REMOTE/.env $SNAP/env.backup && chmod 600 $SNAP/env.backup
    mkdir -p /root/backups/$APP && ln -sfn $SNAP /root/backups/$APP/latest
    echo \"  code \$(du -h $SNAP/code.tar.gz | cut -f1), dbs \$(du -ch $SNAP/*.dump | tail -1 | cut -f1)\""
fi

# -------------------------------------------------------------------- upload
# --delete keeps the server from accumulating removed files. Everything that
# exists ONLY on the server must be excluded or --delete will destroy it:
#   .env  - server credentials, including both database URLs
say "sync source -> $HOST:$REMOTE ${DRY:+(dry run)}"
RSYNC_EXCLUDES=(
  --exclude '.git/' --exclude 'node_modules/' --exclude '.next/'
  --exclude '.env' --exclude '.env.*'
  --exclude '*.db' --exclude '*.db-journal'
  --exclude 'public/uploads/'
  --exclude '*.pem' --exclude '.DS_Store'
)

# Refuse to proceed if the sync would still delete something server-only.
DELETES=$(rsync -azn --delete "${RSYNC_EXCLUDES[@]}" --itemize-changes ./ $HOST:$REMOTE/ 2>/dev/null \
          | grep -i '^\*deleting' || true)
if [ -n "$DELETES" ]; then
  echo "$DELETES" | sed 's/^/  /'
  echo
  # Read from the terminal, not stdin. The rsync above runs over ssh, which
  # swallows stdin — so a piped answer never reaches this prompt and the deploy
  # aborts looking like the guard tripped. No terminal (CI, a background run)
  # means nobody is there to confirm, so it stays aborted.
  if [ -r /dev/tty ]; then
    read -r -p "  These server files will be DELETED. Type 'yes' to continue: " ok < /dev/tty
  else
    die "would delete server files and there is no terminal to confirm on - nothing changed"
  fi
  [ "$ok" = "yes" ] || die "aborted - nothing changed"
fi

rsync -az --delete $DRY "${RSYNC_EXCLUDES[@]}" \
  --itemize-changes \
  ./ $HOST:$REMOTE/ | grep -vE '^$' | head -40

[ -n "$DRY" ] && { echo; echo "dry run complete - nothing changed"; exit 0; }

# ------------------------------------------------------- build, then restart
# `npm ci` WITHOUT --omit=dev: next build needs typescript, tailwind and the
# @types packages, which are devDependencies.
#
# No pipes here. `cmd | tail` returns tail's exit status, which is always 0,
# and that is exactly how a failed build gets mistaken for a good one.
say "install + build on server (site stays up during this)"
if ! ssh $HOST "set -e
    cd $REMOTE
    npm ci > /tmp/hy-ci.log 2>&1        || { echo '--- npm ci failed'; tail -20 /tmp/hy-ci.log; exit 1; }
    npx prisma generate > /tmp/hy-pg.log 2>&1 || { echo '--- prisma generate failed'; tail -20 /tmp/hy-pg.log; exit 1; }
    npm run build > /tmp/hy-build.log 2>&1 || { echo '--- next build failed'; tail -30 /tmp/hy-build.log; exit 1; }
    [ -d .next ] && [ -f .next/BUILD_ID ] || { echo '--- build produced no .next/BUILD_ID'; exit 1; }
    echo \"  build OK, BUILD_ID \$(cat .next/BUILD_ID)\""; then
  echo
  echo "server build FAILED - the running process was NOT restarted, so the"
  echo "site is still serving the previous build. Fix and re-run."
  exit 1
fi

say "restart pm2 process '$APP' only"
ssh $HOST "pm2 restart $APP --update-env >/dev/null && sleep 6
  s=\$(pm2 jlist | python3 -c 'import json,sys; d=json.load(sys.stdin); print(next(p[\"pm2_env\"][\"status\"] for p in d if p[\"name\"]==\"$APP\"))')
  echo \"  status: \$s\"
  [ \"\$s\" = online ] || { echo \"process is \$s, not online\"; exit 1; }" \
  || { echo "process did not come back online - roll back with: scripts/deploy.sh --rollback"; exit 1; }

# ------------------------------------------------------------------- verify
say "verify: all sites after deploy"
if ./scripts/smoke.sh compare; then
  echo
  echo "DEPLOYED OK  ($(git rev-parse --short HEAD))  snapshot: $SNAP"
else
  echo
  echo "REGRESSION DETECTED on one or more domains."
  echo "roll back with:  scripts/deploy.sh --rollback"
  exit 1
fi
