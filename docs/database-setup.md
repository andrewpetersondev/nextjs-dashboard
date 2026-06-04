# Database setup

The app talks to PostgreSQL. The quickest way to get one running locally is
Docker — one network, one container, three databases (dev / test / prod). If you
already have Postgres (local or hosted), skip to [drizzle.md](drizzle.md); all you
need is a reachable `DATABASE_URL`.

The values below match [`.env.example.local`](../.env.example.local): user
`postgres`, password `postgres`, port `5432`, and databases `dev_db` / `test_db` /
`prod_db`. If you change one, change it there too.

## 1. Create a Docker network

```bash
docker network create dashboard-network
```

## 2. Start the PostgreSQL container

```bash
docker run --name dashboard-postgres \
  --network dashboard-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -v pg-data:/var/lib/postgresql/data \
  -d postgres:latest
```

This creates a default `postgres` database; the app's per-environment databases
are created in the next step. (`pg-data` is mounted at the Postgres data
directory so your data survives a container restart.)

## 3. Create the dev / test / prod databases

The app uses a separate database per `DATABASE_ENV`, each named in its
`.env.*.local` file:

```bash
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE dev_db;"
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE test_db;"
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE prod_db;"
```

## 4. Push the schema and seed

With the databases created, generate + apply migrations and load seed data. See
[drizzle.md](drizzle.md) for the full command set (resets, Drizzle Studio, etc.):

```bash
pnpm db:push:dev && pnpm db:seed:dev
```

Swap `:dev` for `:test` or `:prod` to set up the other environments.

## Optional: Adminer (web UI)

To browse the database in a browser instead of `psql`:

```bash
docker run --name dashboard-adminer \
  --network dashboard-network \
  -p 8080:8080 \
  -e ADMINER_DEFAULT_SERVER=dashboard-postgres \
  -d adminer:latest
```

Then open <http://localhost:8080> and log in:

- **System**: PostgreSQL
- **Server**: `dashboard-postgres`
- **Username** / **Password**: `postgres` / `postgres`
- **Database**: `dev_db`
