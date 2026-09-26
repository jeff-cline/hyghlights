#!/usr/bin/env bash
# Check every site on the box, not just this one.
#
# The whole point: a change to HYghLights must not take down any of the other
# domains sharing that server. Run this before deploying to capture a baseline,
# and again after, then compare.
#
#   scripts/smoke.sh              # check all, write results to /tmp/hy-smoke-<ts>.txt
#   scripts/smoke.sh baseline     # save as the baseline to diff against
#   scripts/smoke.sh compare      # re-check and diff against the baseline

set -uo pipefail
cd "$(dirname "$0")/.."

MODE="${1:-run}"
BASELINE="/tmp/hy-smoke-baseline.txt"
OUT="/tmp/hy-smoke-$(date +%H%M%S).txt"

DOMAINS=$(ssh r0cketship 'for f in /etc/nginx/sites-enabled/*; do cat "$f" 2>/dev/null; done' \
  | grep -hoE '^[[:space:]]*server_name[[:space:]]+[^;]+;' \
  | sed -E 's/^[[:space:]]*server_name[[:space:]]+//; s/;$//' \
  | tr ' ' '\n' | grep -vE '^$|^_$|^www\.|localhost' | sort -u)

# An empty list means the SSH read failed, not that the box has no sites. Left
# unchecked that produces "healthy: 0, unhealthy: 0" and a cheerful exit 0 —
# a baseline of nothing, against which no later regression can possibly show.
# Seen for real: sshd throttled a connection mid-run and the comparison after
# the deploy was meaningless.
COUNT=$(printf '%s\n' "$DOMAINS" | grep -c . || true)
if [ "$COUNT" -lt 10 ]; then
  echo "ERROR: only $COUNT domains found in nginx config — expected dozens." >&2
  echo "  The SSH read probably failed. Refusing to report a false all-clear." >&2
  exit 2
fi

printf '%-46s %s\n' "DOMAIN" "HTTP"
: > "$OUT"
for d in $DOMAINS; do
  # -L can emit one code per hop; keep the final one
  code=$(curl -sS -o /dev/null -w '%{http_code}' -L --max-redirs 5 --max-time 15 "https://$d" 2>/dev/null | tail -c 3)
  [ -z "$code" ] && code="000"
  printf '%-46s %s\n' "$d" "$code"
  echo "$d $code" >> "$OUT"
done

ok=$(awk '$2 ~ /^(200|301|302|401|403)$/' "$OUT" | wc -l | tr -d ' ')
bad=$(awk '$2 !~ /^(200|301|302|401|403)$/' "$OUT" | wc -l | tr -d ' ')
echo
echo "healthy: $ok    unhealthy: $bad    ($OUT)"
[ "$bad" -gt 0 ] && { echo "--- not healthy:"; awk '$2 !~ /^(200|301|302|401|403)$/ {print "   "$1" -> "$2}' "$OUT"; }

case "$MODE" in
  baseline) cp "$OUT" "$BASELINE"; echo "baseline saved -> $BASELINE" ;;
  compare)
    if [ ! -f "$BASELINE" ]; then echo "no baseline; run: scripts/smoke.sh baseline"; exit 1; fi
    echo; echo "=== changes vs baseline ==="
    if diff <(sort "$BASELINE") <(sort "$OUT") > /tmp/hy-smoke-diff.txt; then
      echo "none - every domain returns what it did before"
    else
      # only regressions matter: was healthy, now is not
      join <(sort "$BASELINE") <(sort "$OUT") \
        | awk '$2 ~ /^(200|301|302|401|403)$/ && $3 !~ /^(200|301|302|401|403)$/ {print "  REGRESSED: "$1"  "$2" -> "$3}' \
        | tee /tmp/hy-regressions.txt
      [ -s /tmp/hy-regressions.txt ] && exit 1 || echo "  no regressions (only improvements/new domains)"
    fi ;;
esac
exit 0
