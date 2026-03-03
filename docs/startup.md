# Startup

## PostgreSQL Container

Create a Docker network:

```bash
docker network create dashboard-network
```

Start the PostgreSQL container:

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

Replace `{your_postgres_user}`, `{your_postgres_password}`, and `{your_postgres_db}` with your desired values.

## Adminer Container

Start an Adminer container to manage the database via a web UI:

```bash
docker run --name dashboard-adminer \
  --network dashboard-network \
  -p 8080:8080 \
  -e ADMINER_DEFAULT_SERVER=dashboard-postgres \
  -d adminer:latest
```

Login details:

- **System**: PostgreSQL
- **Server**: `dashboard-postgres`
- **Username**: `{your_postgres_user}`
- **Password**: `{your_postgres_password}`
- **Database**: `{your_postgres_db}`

## Create the Test Database

The test database must be created manually. Use one of the following approaches:

**Via Adminer** (recommended): log in and create the database through the UI.

**Via CLI**:

```bash
docker exec -it dashboard-postgres psql -U {your_postgres_user} -c "CREATE DATABASE postgres_test;"
```

## Next.js

Start the development server:

```bash
pnpm dev
```

Build and start in standalone production mode:

```bash
pnpm standalone
```

Or, if already built:

```bash
pnpm start:standalone
```

## Drizzle Kit

Generate and apply migrations for the test environment:

```bash
pnpm db:generate:migrate:test
```

For development:

```bash
pnpm db:generate:migrate:dev
```

See [docs/guides/drizzle.md](./guides/drizzle.md) for the full list of database commands.
