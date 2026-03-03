# Steps to Create a Database

## Step 1: Start a PostgreSQL Container

```bash
docker run --name dashboard-postgres \
  --network dashboard-network \
  -e POSTGRES_USER={your_postgres_user} \
  -e POSTGRES_PASSWORD={your_postgres_password} \
  -e POSTGRES_DB={your_postgres_db} \
  -p 5432:5432 \
  -v pg-data:/var/lib/postgresql \
  -d postgres:latest
```

Replace `{your_postgres_user}`, `{your_postgres_password}`, and `{your_postgres_db}` with your desired values.

> **Note:** This step automatically creates a default database named after `POSTGRES_DB`.

## Step 2: Create Additional Databases

```bash
docker exec -it dashboard-postgres psql -U {your_postgres_user} -c "CREATE DATABASE postgres_test;"
```

## Step 3: Push Schema

Use [drizzle.md](./guides/drizzle.md) to generate and apply migrations to the database.
