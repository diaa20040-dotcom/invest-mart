#!/usr/bin/env bash
set -euo pipefail
CF="${CLOUDFLARED:-/tmp/cloudflared}"
if ! command -v "$CF" >/dev/null 2>&1 && [ ! -x "$CF" ]; then
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
  chmod +x /tmp/cloudflared
  CF=/tmp/cloudflared
fi
exec "$CF" tunnel --url http://127.0.0.1:3000
