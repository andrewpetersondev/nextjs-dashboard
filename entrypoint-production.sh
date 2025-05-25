#!/bin/sh

set -e

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting production entrypoint script"

# log "Database Migrations"
# echo "Running database migrations..."
# pnpm drizzle-schema-update

# log "Database Seeding"
# echo "Seeding database (if needed)..."

# log "Seeding Dev Database..."
# pnpm drizzle-seed

log "entrypoint script does not do a god damn thing"
log "fucking hell"

log "Entrypoint script completed, executing command: $@"
echo "Starting Next.js app..."
exec "$@"
