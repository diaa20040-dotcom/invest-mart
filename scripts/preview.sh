#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! curl -sf -o /dev/null http://127.0.0.1:3000/login; then
  echo "Starting dev server on :3000..."
  SESSION="invest-dev"
  tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION" 2>/dev/null || \
    tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION" -c "$ROOT" -- "${SHELL:-bash}" -l
  tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION:0.0" "cd $ROOT && npm run dev" C-m
  for i in $(seq 1 30); do
    curl -sf -o /dev/null http://127.0.0.1:3000/login && break
    sleep 2
  done
fi

CF="${CLOUDFLARED:-/tmp/cloudflared}"
if ! [ -x "$CF" ]; then
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
  chmod +x /tmp/cloudflared
fi

SESSION="invest-tunnel"
tmux -f /exec-daemon/tmux.portal.conf kill-session -t "=$SESSION" 2>/dev/null || true
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION" -c "$ROOT" -- "${SHELL:-bash}" -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION:0.0" "$CF tunnel --url http://127.0.0.1:3000 2>&1 | tee /tmp/invest-tunnel.log" C-m

echo "Waiting for public URL..."
for i in $(seq 1 45); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/invest-tunnel.log 2>/dev/null | head -1)
  if [ -n "$URL" ]; then
    echo "PUBLIC_URL=$URL"
    exit 0
  fi
  sleep 2
done
echo "Tunnel URL not ready — check /tmp/invest-tunnel.log"
exit 1
