#!/bin/sh

export SESSION_SECRET=$(cat /run/secrets/session_secret)
export POSTGRES_DB=$(cat /run/secrets/postgres_db)
export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
export PGPASSWORD=$POSTGRES_PASSWORD
export POSTGRES_URL=$(cat /run/secrets/postgres_url)

echo "Loading environment variables in entrypoint.sh..."
echo "SESSION_SECRET=$SESSION_SECRET"
echo "POSTGRES_DB=$POSTGRES_DB"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "POSTGRES_URL=$POSTGRES_URL"
echo "Environment variables loaded successfully."

until pg_isready -h postgres -U postgres; do
  echo waiting for postgres
  sleep 2
done

psql -h postgres -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || psql -h postgres -U postgres -c "CREATE DATABASE $POSTGRES_DB"

psql -h postgres -U postgres -d $POSTGRES_DB -c 'CREATE SCHEMA IF NOT EXISTS public;' || true

exec "$@"