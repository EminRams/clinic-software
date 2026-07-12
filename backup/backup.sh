#!/bin/bash
set -euo pipefail

# Runs forever inside its own container: dumps Postgres once every 24h,
# keeps a 30-day local copy, and pushes the same file to Cloudflare R2
# (S3-compatible endpoint) so a lost VPS doesn't mean lost backups too.

while true; do
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    FILE="/backups/clinic_db_${TIMESTAMP}.sql.gz"

    echo "[$(date)] Starting backup -> ${FILE}"
    PGPASSWORD="${PGPASSWORD}" pg_dump -h "${PGHOST}" -U "${PGUSER}" "${PGDATABASE}" | gzip > "${FILE}"

    echo "[$(date)] Uploading to R2..."
    aws s3 cp "${FILE}" "s3://${R2_BUCKET}/" --endpoint-url "${R2_ENDPOINT}"

    echo "[$(date)] Cleaning local backups older than 30 days..."
    find /backups -name '*.sql.gz' -mtime +30 -delete

    echo "[$(date)] Backup cycle complete. Sleeping 24h."
    sleep 86400
done
