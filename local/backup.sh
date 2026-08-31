#!/usr/bin/env bash
#
# One dump is the whole backup.
#
# Attachments are stored as bytes in Postgres rather than as files on disk, so
# there is no second thing to remember. Restoring is `psql` against an empty
# database and nothing else.
#
#   ./backup.sh [dbname]        # default: atlaspm
#
set -euo pipefail

DB="${1:-atlaspm}"
OUT="$HOME/atlaspm-backups"
KEEP=30

mkdir -p "$OUT"
STAMP="$(date +%Y-%m-%d_%H%M)"
FILE="$OUT/$DB-$STAMP.sql.gz"

# Write to a temporary name and move it into place, so a dump interrupted
# half-way never looks like a backup somebody could restore from.
pg_dump --no-owner --no-privileges "$DB" | gzip > "$FILE.part"
mv "$FILE.part" "$FILE"

# Keep the most recent $KEEP, drop the rest.
ls -1t "$OUT/$DB-"*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "$old"
done

printf '%s  %s  (%s)\n' "$(date '+%Y-%m-%d %H:%M')" "$(basename "$FILE")" "$(du -h "$FILE" | cut -f1)"
