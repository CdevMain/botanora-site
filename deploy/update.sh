#!/usr/bin/env bash
# Botânora: atualizar a VPS com a versão mais recente do repositório.
#   sudo bash /var/www/botanora/deploy/update.sh
set -euo pipefail
APP_DIR=/var/www/botanora
cd "$APP_DIR"

# Backup rápido dos dados antes de atualizar (pedidos, métricas, PDFs enviados)
mkdir -p /var/backups/botanora
tar -czf "/var/backups/botanora/data-$(date +%Y%m%d-%H%M%S).tgz" -C "$APP_DIR" data .env
ls -1t /var/backups/botanora/data-*.tgz | tail -n +15 | xargs -r rm --

# O repositório pertence ao usuário botanora; libera o git do root para usá-lo (gits antigos ignoram "-c safe.directory")
git config --global --get-all safe.directory 2>/dev/null | grep -qx "$APP_DIR" || git config --global --add safe.directory "$APP_DIR"
git pull --ff-only
chown -R botanora:botanora "$APP_DIR"
systemctl restart botanora
sleep 2
systemctl is-active --quiet botanora && echo "Botânora atualizado e rodando." || { journalctl -u botanora -n 30 --no-pager; exit 1; }
