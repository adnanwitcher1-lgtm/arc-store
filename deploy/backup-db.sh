#!/usr/bin/env bash
# Daily PostgreSQL backup for the store (your VPS has no Auto Backup). Keeps the last 14 dumps.
# Cron (as root):  0 3 * * *  /var/www/jamshan-store/deploy/backup-db.sh
# Copy the files in /var/backups/jamshan off the server now and then (scp / rclone) — a backup on the
# same disk does not survive losing the server.
set -euo pipefail
DB="${DB:-jamshan_db}"
DEST="${DEST:-/var/backups/jamshan}"
mkdir -p "$DEST"
sudo -u postgres pg_dump "$DB" | gzip > "$DEST/${DB}_$(date +%F_%H%M).sql.gz"
ls -1t "$DEST"/${DB}_*.sql.gz | tail -n +15 | xargs -r rm --
