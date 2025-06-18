#!/bin/sh

set -e

# Print a message with timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting entrypoint script"
log "Loading environment variables from .env.development"
# Note: Environment variables should already be loaded from .env.development
# or passed directly to the container

log "Ensuring testDB exists"
# Use environment variables directly
TEST_DB_NAME="${POSTGRES_TEST_DB}"
TEST_DB_USER="${POSTGRES_TEST_USER}"
TEST_DB_HOST="testDB"  # Container service name
TEST_DB_PORT="5432"    # Default PostgreSQL port

# Try to create testDB if it doesn't exist
log "Checking if test database exists: ${TEST_DB_NAME}"
PGPASSWORD="${POSTGRES_TEST_PASSWORD}" psql -U "${TEST_DB_USER}" -h "${TEST_DB_HOST}" -p "${TEST_DB_PORT}" -tc "SELECT 1 FROM pg_database WHERE datname = '${TEST_DB_NAME}';" | grep -q 1 || \
PGPASSWORD="${POSTGRES_TEST_PASSWORD}" createdb -U "${TEST_DB_USER}" -h "${TEST_DB_HOST}" -p "${TEST_DB_PORT}" "${TEST_DB_NAME}"

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
