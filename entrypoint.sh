#!/bin/sh
set -e

# Print a message with timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting entrypoint script"

# Load secrets into environment variables
log "Loading secrets"
export SESSION_SECRET=$(cat /run/secrets/session_secret)
export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
export POSTGRES_URL=$(cat /run/secrets/postgres_url)

# Wait for PostgreSQL to be ready
log "Waiting for PostgreSQL to be ready"
until pg_isready -h db -U postgres; do
  log "PostgreSQL is not ready yet - waiting"
  sleep 2
done
log "PostgreSQL is ready"

# Check if node_modules exists and has the right permissions
if [ ! -d "node_modules" ] || [ ! -w "node_modules" ]; then
  log "Installing dependencies (node_modules missing or not writable)"
  # Use --prefer-offline to use cache when possible
  pnpm install --prefer-offline
else
  # Check if package.json has changed since last install
  if [ package.json -nt node_modules/.package-json-timestamp ]; then
    log "Package.json has changed, reinstalling dependencies"
    pnpm install --prefer-offline
    # Create timestamp file to track when we last installed
    touch node_modules/.package-json-timestamp
  else
    log "Dependencies are up to date"
  fi
fi

log "Entrypoint script completed, executing command: $@"
exec "$@"
