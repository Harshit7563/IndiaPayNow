#!/usr/bin/env bash
# India Pay Now — run on the VPS after git clone
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> India Pay Now deploy"
echo "    Directory: $APP_DIR"

if [ ! -f server/.env ]; then
  echo "Creating server/.env from example..."
  cp .env.example server/.env
  # Production defaults
  {
    echo ""
    echo "NODE_ENV=production"
    echo "PORT=5001"
    echo "CLIENT_URL=*"
    echo "DB_PATH=$APP_DIR/server/data/indiapaynow.db"
  } >> server/.env
  echo "WARNING: Edit server/.env and set JWT_SECRET + RAPIDAPI_KEY"
fi

echo "==> Installing dependencies..."
npm run install:all

echo "==> Building client..."
npm run build

mkdir -p server/data

echo "==> Bootstrapping DB (seed if empty)..."
node server/src/db/bootstrap.js

echo "==> Starting with PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm i -g pm2
fi

pm2 delete india-pay-now 2>/dev/null || true
pm2 start server/src/index.js \
  --name india-pay-now \
  --cwd "$APP_DIR" \
  --env NODE_ENV=production
pm2 save

echo ""
echo "==> Deploy complete"
echo "    Health: curl -s http://127.0.0.1:5001/health"
echo "    Configure Nginx using deploy/nginx.conf"
