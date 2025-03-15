#!/bin/sh

export SESSION_SECRET=$(cat /run/secrets/session_secret)
# Note 2: This variable defines the superuser password in the PostgreSQL instance, as set by the initdb script during initial container startup. It has no effect on the PGPASSWORD environment variable that may be used by the psql client at runtime, as described at https://www.postgresql.org/docs/14/libpq-envars.html⁠. PGPASSWORD, if used, will be specified as a separate environment variable.
export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
export POSTGRES_URL=$(cat /run/secrets/postgres_url)

echo "Loading environment variables in entrypoint.sh..."
echo "SESSION_SECRET=$SESSION_SECRET"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "POSTGRES_URL=$POSTGRES_URL"
echo "Environment variables loaded..."

until pg_isready -h db -U postgres; do
  echo "waiting for postgres"
  sleep 2
done

exec "$@"