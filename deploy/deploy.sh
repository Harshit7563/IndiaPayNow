#!/usr/bin/env bash
# India Pay Now — run on the VPS after git clone
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> India Pay Now deploy"
echo "    Directory: $APP_DIR"

need_root_apt() {
  if command -v apt-get >/dev/null 2>&1; then
    if [ "$(id -u)" -eq 0 ]; then
      apt-get update -y
      apt-get install -y build-essential python3 git curl ca-certificates
    else
      sudo apt-get update -y
      sudo apt-get install -y build-essential python3 git curl ca-certificates
    fi
  fi
}

echo "==> Ensuring build tools (make/g++)..."
need_root_apt

# Prefer Node 22+ for better-sqlite3
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "==> Upgrading Node.js to 22.x (current: $(node -v 2>/dev/null || echo none))..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  if [ "$(id -u)" -eq 0 ]; then
    apt-get install -y nodejs
  else
    sudo apt-get install -y nodejs
  fi
fi

echo "    Node: $(node -v)"
echo "    npm:  $(npm -v)"

if [ ! -f server/.env ]; then
  echo "Creating server/.env from example..."
  cp .env.example server/.env
  {
    echo ""
    echo "NODE_ENV=production"
    echo "PORT=5010"
    echo "CLIENT_URL=*"
    echo "DB_PATH=$APP_DIR/server/data/indiapaynow.db"
  } >> server/.env
  echo "WARNING: Edit server/.env and set JWT_SECRET + RAPIDAPI_KEY"
else
  # Ensure production port (avoid clash with other apps on 5001)
  if ! grep -q '^PORT=' server/.env; then
    echo "PORT=5010" >> server/.env
  else
    sed -i 's/^PORT=.*/PORT=5010/' server/.env
  fi
  if ! grep -q '^NODE_ENV=' server/.env; then
    echo "NODE_ENV=production" >> server/.env
  else
    sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' server/.env
  fi
  if ! grep -q '^CLIENT_URL=' server/.env; then
    echo "CLIENT_URL=*" >> server/.env
  fi
fi

echo "==> Installing dependencies (web only)..."
rm -rf server/node_modules/better-sqlite3 2>/dev/null || true
npm run install:web

echo "==> Building client..."
npm run build

mkdir -p server/data

echo "==> Bootstrapping DB (seed if empty)..."
node server/src/db/bootstrap.js

echo "==> Starting with PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm i -g pm2
fi

export NODE_ENV=production
pm2 delete india-pay-now 2>/dev/null || true
pm2 start server/src/index.js \
  --name india-pay-now \
  --cwd "$APP_DIR" \
  --update-env
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

echo ""
echo "==> Deploy complete"
echo "    Health: curl -s http://127.0.0.1:5010/health"
echo "    Configure Nginx: cp deploy/nginx.conf /etc/nginx/sites-available/indiapaynow && ln -sf /etc/nginx/sites-available/indiapaynow /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
