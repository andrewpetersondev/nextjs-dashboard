#!/bin/bash
set -e

# Print a message with timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Docker test script"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  log "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if docker compose is installed
if ! command -v docker &> /dev/null; then
  log "Error: Docker is not installed. Please install it and try again."
  exit 1
fi

# Clean up any existing containers
log "Cleaning up any existing containers"
docker compose -f compose.dev.yaml down -v 2>/dev/null || true

# Build the containers
log "Building containers"
docker compose -f compose.dev.yaml build

# Start the containers
log "Starting containers"
docker compose -f compose.dev.yaml up -d

# Wait for the web service to be ready
log "Waiting for web service to be ready"
attempt=1
max_attempts=30
until docker compose -f compose.dev.yaml exec -T web curl -s http://localhost:3000 > /dev/null || [ $attempt -gt $max_attempts ]; do
  log "Attempt $attempt/$max_attempts: Web service is not ready yet"
  sleep 5
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  log "Error: Web service did not become ready within the expected time"
  log "Showing logs from web service:"
  docker compose -f compose.dev.yaml logs web
  log "Cleaning up containers"
  docker compose -f compose.dev.yaml down -v
  exit 1
fi

log "Web service is ready"

# Check if the database is accessible
log "Testing database connection"
if docker compose -f compose.dev.yaml exec -T db pg_isready -U postgres; then
  log "Database connection successful"
else
  log "Error: Could not connect to database"
  log "Showing logs from db service:"
  docker compose -f compose.dev.yaml logs db
  log "Cleaning up containers"
  docker compose -f compose.dev.yaml down -v
  exit 1
fi

# Check if Adminer is accessible
log "Testing Adminer connection"
if docker compose -f compose.dev.yaml exec -T web curl -s http://adminer:8080 > /dev/null; then
  log "Adminer connection successful"
else
  log "Error: Could not connect to Adminer"
  log "Showing logs from adminer service:"
  docker compose -f compose.dev.yaml logs adminer
  log "Cleaning up containers"
  docker compose -f compose.dev.yaml down -v
  exit 1
fi

log "All tests passed successfully!"
log "You can now access:"
log "- Next.js application: http://localhost:3000"
log "- Adminer: http://localhost:8080"
log "- PostgreSQL: localhost:5432"

log "To stop the containers, run: docker compose -f compose.dev.yaml down"
