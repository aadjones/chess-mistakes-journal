#!/bin/bash

# Simple SQLite database backup script
# Creates timestamped backups in a backups directory

set -e

# Configuration
DB_FILE="prisma/dev.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/dev_${TIMESTAMP}.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
  echo "❌ Database file not found: $DB_FILE"
  exit 1
fi

# Create backup
echo "📦 Creating backup..."
cp "$DB_FILE" "$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

  # Show number of backups
  BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.db 2>/dev/null | wc -l | tr -d ' ')
  echo "📊 Total backups: $BACKUP_COUNT"

  # Optional: Clean up old backups (keep last 10)
  # Uncomment the following lines to enable auto-cleanup:
  # echo "🧹 Cleaning up old backups (keeping last 10)..."
  # ls -t "$BACKUP_DIR"/*.db | tail -n +11 | xargs -r rm
else
  echo "❌ Backup failed"
  exit 1
fi
