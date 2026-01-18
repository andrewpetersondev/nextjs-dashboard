# Steps to Create a Database

## Step 1: Use Docker to Create a Database

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

### _**THIS STEP ALWAYS CREATES A TABLE CALLED POSTGRES**_


## Step 2: Use Docker to Create a Table


```bash
docker exec -it dashboard-postgres psql -U {your_postgres_user} -c "CREATE DATABASE postgres_test;"
````

## Step 3: Push Schema (assuming POSTGRES_URL_TESTDB=postgresql://postgres:postgres@localhost:5432/test_db)

```bash
hcp vault-secrets run -- pnpm drizzle-kit push --config=drizzle-test.config.ts
```
