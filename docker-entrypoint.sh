#!/bin/sh
# Read secrets and export as environment variables
export SESSION_SECRET=$(cat /run/secrets/session_secret)
export DB_PASSWORD=$(cat /run/secrets/db_password)
export DB_USER=$(cat /run/secrets/db_user)
export CONNECTION_STRING=$(cat /run/secrets/connection_string)

# Print the environment variables for debugging
echo "SESSION_SECRET=$SESSION_SECRET"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "DB_USER=$DB_USER"
echo "CONNECTION_STRING=$CONNECTION_STRING"
echo "Environment variables loaded successfully."

# Execute the command passed to the script (typically starting Next.js)
exec "$@"