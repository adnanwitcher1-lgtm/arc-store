#!/usr/bin/env bash
# Update the live site on the Contabo server:  bash deploy/deploy.sh
# Pulls the latest code from GitHub, updates the backend, rebuilds the frontend, reloads Nginx.
# Override defaults if your paths differ:  APP_DIR=/var/www/x SERVICE=y VENV=/path/to/venv bash deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/jamshan-store}"
SERVICE="${SERVICE:-jamshan-store}"
BRANCH="${BRANCH:-main}"
VENV="${VENV:-}"

cd "$APP_DIR"
if [ -z "$VENV" ]; then
  for c in "$APP_DIR/venv" "$APP_DIR/.venv" "$APP_DIR/backend/venv"; do
    [ -x "$c/bin/python" ] && VENV="$c" && break
  done
fi
[ -n "$VENV" ] || { echo "Could not find the virtualenv — set VENV=/path/to/venv"; exit 1; }
[ -f backend/.env ] || { echo "Missing backend/.env — copy deploy/backend.env.example and fill it in"; exit 1; }
[ -f frontend/.env.production ] || { echo "Missing frontend/.env.production — copy deploy/frontend.env.production.example and fill it in"; exit 1; }
command -v node >/dev/null || { echo "Node.js is not installed (need 22.x):  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs"; exit 1; }

echo "==> Pulling latest code ($BRANCH)"
git pull --ff-only origin "$BRANCH"

echo "==> Backend: dependencies, migrations, static files"
"$VENV/bin/pip" install -q -r backend/requirements.txt -r backend/requirements-prod.txt
( cd backend
  "$VENV/bin/python" manage.py migrate --noinput
  "$VENV/bin/python" manage.py collectstatic --noinput >/dev/null )
systemctl restart "$SERVICE"

echo "==> Frontend: build"
( cd frontend
  npm ci --no-audit --no-fund
  npm run build
  chmod -R o+rX dist )

echo "==> Reloading Nginx"
nginx -t
systemctl reload nginx

echo "Done. Quick check:"
curl -s -o /dev/null -w "  api sitemap  -> HTTP %{http_code}\n" http://127.0.0.1:8004/sitemap.xml -H "Host: api.jamshan.com" -H "X-Forwarded-Proto: https" || true
systemctl is-active "$SERVICE" | sed 's/^/  gunicorn     -> /'
