#!/usr/bin/env bash
# Botânora: instalação na VPS (Ubuntu + Nginx). Rode como root, uma única vez:
#   sudo bash deploy/setup.sh
# Pré-requisitos: DNS do botanora.cdev.com.br apontando para esta VPS e o código em /var/www/botanora.
set -euo pipefail

APP_DIR=/var/www/botanora
DOMAIN=botanora.cdev.com.br
PORT=3010
EMAIL_CERTBOT=${EMAIL_CERTBOT:-cdev.main@gmail.com}

echo "==> Node.js"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v

echo "==> Usuário do serviço"
id botanora >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin botanora

if [ ! -f "$APP_DIR/server.js" ]; then
  echo "Código não encontrado em $APP_DIR. Clone o repositório lá antes (git clone <repo> $APP_DIR)." >&2
  exit 1
fi

echo "==> .env de produção"
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  PASS=$(openssl rand -base64 12 | tr -d '/+=')
  sed -i \
    -e "s|^PORT=.*|PORT=$PORT|" \
    -e "s|^HOST=.*|HOST=127.0.0.1|" \
    -e "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|" \
    -e "s|^TRUST_PROXY=.*|TRUST_PROXY=1|" \
    -e "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$PASS|" \
    -e "s|^SESSION_SECRET=.*|SESSION_SECRET=$(openssl rand -hex 24)|" \
    "$APP_DIR/.env"
  echo
  echo "   Senha do painel /admin: $PASS   (guarde; está em $APP_DIR/.env)"
  echo
fi
chmod 600 "$APP_DIR/.env"
mkdir -p "$APP_DIR/data"
chown -R botanora:botanora "$APP_DIR"

echo "==> systemd"
cp "$APP_DIR/deploy/botanora.service" /etc/systemd/system/botanora.service
systemctl daemon-reload
systemctl enable --now botanora
sleep 2
systemctl --no-pager --lines=5 status botanora || true

echo "==> Nginx"
cp "$APP_DIR/deploy/nginx/$DOMAIN.conf" "/etc/nginx/sites-available/$DOMAIN.conf"
ln -sf "/etc/nginx/sites-available/$DOMAIN.conf" "/etc/nginx/sites-enabled/$DOMAIN.conf"
nginx -t
systemctl reload nginx

echo "==> HTTPS (Let's Encrypt)"
if ! [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL_CERTBOT" --redirect
fi

echo "==> Teste"
curl -s -o /dev/null -w "http://127.0.0.1:$PORT/pt -> %{http_code}\n" "http://127.0.0.1:$PORT/pt"
echo "Pronto: https://$DOMAIN  ·  painel: https://$DOMAIN/admin"
