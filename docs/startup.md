# Startup

## PostgreSQL Container

To start the database, create a Docker container by running the following command:

```bash
docker network create dashboard-network
```

Start the PostgreSQL container on the network:

```bash
docker run --name dashboard-postgres \
  --network dashboard-network \
  -e POSTGRES_USER={your_postgres_user} \
  -e POSTGRES_PASSWORD={your_postgres_password} \
  -e POSTGRES_DB={your_postgres_db} \
  -p 5432:5432 \
  -v pg-data:/var/lib/postgresql/data \
  -d postgres:latest
```

Replace `{your_postgres_user}`, `{your_postgres_password}`, and `{your_postgres_db}` with your desired PostgreSQL user, password, and database name.

## Adminer Container

To manage the PostgreSQL database, you can use Adminer. Start an Adminer container with the following command:

```bash
docker run --name dashboard-adminer \
  --network dashboard-network \
  -p 8080:8080 \
  -e ADMINER_DEFAULT_SERVER=dashboard-postgres \
  -d adminer:latest
```

Login Details:

- **System**: PostgreSQL
- **Server**: dashboard-postgres
- **Username**: `{your_postgres_user}`
- **Password**: `{your_postgres_password}`
- **Database**: `{your_postgres_db}`

### TEST DATABASE NEEDS TO BE CREATED MANUALLY

- Easily create a test database using Adminer
- _OR_ **make life difficult** and create it manually using the CLI.

```bash
docker exec -it dashboard-postgres psql -U {your_postgres_user} -c "CREATE DATABASE postgres_test;"
````

- _OR_ **automate it for no reason** by ...

## Next.js

To start the Next.js application with development server, run the following command:

```bash
hcp vault-secrets run -- pnpm next dev
```

This command will start the Next.js development server, allowing you to access the application at `http://localhost:3000`.

To start the Next.js application in standalone production mode, first build the application and then start it:

```bash
hcp vault-secrets run -- pnpm next build
hcp vault-secrets run -- pnpm next start
```

"start" should point to `node .next/standalone/server.js`

### Example Production Start Command

```bash
hcp vault-secrets run -- rm -rf ".next" && next build --turbopack && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ && node .next/standalone/server.js
```

## Drizzle Kit

To run Drizzle Kit commands, you need to ensure that the environment variables are set up correctly. Use the following command to run Drizzle Kit migrations:

```bash
hcp vault-secrets run -- pnpm drizzle-kit up --config=drizzle-test.config.ts
```

To generate the Drizzle Kit schema, use:

```bash
hcp vault-secrets run -- pnpm drizzle-kit generate --config=drizzle-test.config.ts
```
