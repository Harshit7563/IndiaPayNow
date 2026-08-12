#!/usr/bin/env bash
# Run from your Mac: bash deploy/remote-deploy.sh [user@host]
set -euo pipefail

HOST="${1:-root@187.127.164.150}"
REPO="https://github.com/Harshit7563/IndiaPayNow.git"
APP_DIR="/var/www/indiapaynow"

echo "==> Deploying India Pay Now to $HOST"

ssh -o StrictHostKeyChecking=accept-new "$HOST" bash -s <<EOF
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs build-essential python3
fi
apt-get update -y
apt-get install -y git nginx

mkdir -p /var/www
if [ -d $APP_DIR/.git ]; then
  cd $APP_DIR
  git fetch origin
  git reset --hard origin/main
else
  rm -rf $APP_DIR
  git clone $REPO $APP_DIR
  cd $APP_DIR
fi

chmod +x deploy/deploy.sh
bash deploy/deploy.sh

cp deploy/nginx.conf /etc/nginx/sites-available/indiapaynow
ln -sf /etc/nginx/sites-available/indiapaynow /etc/nginx/sites-enabled/indiapaynow
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "PUBLIC_IP=\$(curl -4 -s ifconfig.me || true)"
EOF

echo ""
echo "Done. Open http://SERVER_IP (or your domain after DNS A record)."
echo "Then set RAPIDAPI_KEY on VPS: nano $APP_DIR/server/.env && pm2 restart india-pay-now"
