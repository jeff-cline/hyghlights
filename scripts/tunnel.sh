#!/usr/bin/env bash
# Open an SSH tunnel to the server's Postgres so local dev can use the *_dev
# database clones.
#
# Point .env.local at 127.0.0.1:15433 for BOTH databases:
#   DATABASE_URL="postgresql://…@127.0.0.1:15433/hyghlights_dev"
#   IDENTITY_DATABASE_URL="postgresql://…@127.0.0.1:15433/beyondlimits_dev"
#
# 15433, not 15432: Beyond Limits' tunnel already uses 15432, and both are
# often open at once when working across the two products.
#
#   scripts/tunnel.sh          # foreground, Ctrl-C to close
#   scripts/tunnel.sh status   # is it up?

set -uo pipefail
PORT=15433

if [ "${1:-}" = "status" ]; then
  if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
    echo "tunnel UP on 127.0.0.1:$PORT"
    lsof -iTCP:$PORT -sTCP:LISTEN | tail -n +2
  else
    echo "tunnel DOWN - run: scripts/tunnel.sh"
  fi
  exit 0
fi

if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "tunnel already up on 127.0.0.1:$PORT"; exit 0
fi

echo "forwarding 127.0.0.1:$PORT -> r0cketship:5432 (Ctrl-C to close)"
echo "dev databases: hyghlights_dev, beyondlimits_dev"
exec ssh -N -L ${PORT}:127.0.0.1:5432 r0cketship
