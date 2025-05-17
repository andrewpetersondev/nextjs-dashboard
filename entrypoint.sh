#!/bin/sh
set -e

# Print a message with timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting entrypoint script"

# Load secrets into environment variables
log "Loading secrets"
export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
export POSTGRES_TESTDB_PASSWORD=$(cat /run/secrets/postgres_testdb_password)
export POSTGRES_TESTDB_URL=$(cat /run/secrets/postgres_testdb_url)
export POSTGRES_URL=$(cat /run/secrets/postgres_url)
export SESSION_SECRET=$(cat /run/secrets/session_secret)

log "Database Migrations"
echo "Running database migrations..."
pnpm drizzle-schema-update
pnpm drizzle-schema-update-testDB

log "Database Seeding"
echo "Seeding database (if needed)..."

log "Seeding Dev Database..."
pnpm drizzle-seed

log "Seeding Test Database..."
pnpm drizzle-seed-testDB

log "Entrypoint script completed, executing command: $@"
echo "Starting Next.js app..."
exec "$@"
