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

log "Entrypoint script completed, executing command: $@"
exec "$@"
