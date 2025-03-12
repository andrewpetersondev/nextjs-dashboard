#!/bin/sh
# Read secrets and export as environment variables
export SESSION_SECRET=$(cat /run/secrets/session_secret)
export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
export POSTGRES_USER=$(cat /run/secrets/postgres_user)
export POSTGRES_DB=$(cat /run/secrets/postgres_db)
export POSTGRES_HOST=$(cat /run/secrets/postgres_host)
export POSTGRES_PORT=$(cat /run/secrets/postgres_port)
# export POSTGRES_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
export POSTGRES_URL=$(cat /run/secrets/postgres_url)

# Print the environment variables for debugging
echo "SESSION_SECRET=$SESSION_SECRET"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "POSTGRES_URL=$POSTGRES_URL"
echo "POSTGRES_USER=$POSTGRES_USER"
echo "POSTGRES_DB=$POSTGRES_DB"
echo "POSTGRES_HOST=$POSTGRES_HOST"
echo "POSTGRES_PORT=$POSTGRES_PORT"
echo "Environment variables loaded successfully."

# Create the database if it doesn't exist
# if ! psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$POSTGRES_DB" -c '\l' | grep -q "$POSTGRES_DB"; then
#   echo "Creating database $POSTGRES_DB..."
#   createdb -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" "$POSTGRES_DB"
# else
#   echo "Database $POSTGRES_DB already exists."
# fi

# Execute the command passed to the script (typically starting Next.js)
exec "$@"