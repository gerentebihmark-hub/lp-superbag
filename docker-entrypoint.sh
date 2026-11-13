#!/bin/sh
set -eu

mkdir -p "${DATA_DIR:-/data}"

python3 -u /app/api/server.py &
API_PID=$!

# Aguarda a API responder localmente antes de abrir o nginx ao tráfego.
i=0
while [ "$i" -lt 25 ]; do
  if python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:3001/api/health', timeout=1).read()" >/dev/null 2>&1; then
    break
  fi
  i=$((i + 1))
  sleep 0.2
done

nginx -g "daemon off;" &
NGINX_PID=$!

cleanup() {
  kill -TERM "$NGINX_PID" "$API_PID" 2>/dev/null || true
  wait "$NGINX_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  exit 0
}

trap cleanup TERM INT

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
  sleep 2
done

cleanup_exit=1
kill -TERM "$NGINX_PID" "$API_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true
wait "$API_PID" 2>/dev/null || true
exit "$cleanup_exit"
