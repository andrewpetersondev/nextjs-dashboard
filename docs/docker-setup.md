# Steps to Setup a Database with Docker

About: This guide provides step-by-step instructions to set up a PostgreSQL database using Docker. The containerized database will be started from "Docker Desktop App" by clicking the "Run" button.

## Step 1: Create a Docker Network

```bash
docker network create dashboard-network
```

## Step 2: Use Docker to Create a Database

```bash
docker run --name dashboard-postgres \
  --network dashboard-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -v pg-data:/var/lib/postgresql \
  -d postgres:latest
```

_**THIS STEP ALWAYS CREATES A TABLE CALLED POSTGRES**_

## Step 2: Use Docker to Create a default administrative Database

```bash
docker exec -it dashboard-postgres psql -U {POSTGRES_USER} -c "CREATE DATABASE {DATABASE_NAME};"
```

create a database named `test_db`:

```bash
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE test_db;"
```

create a database named `dev_db`:

```bash
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE dev_db;"
```

create a database named `prod_db`:

```bash
docker exec -it dashboard-postgres psql -U postgres -c "CREATE DATABASE prod_db;"
```

## Step 3: Set Up Schema

Use [drizzle.md](./guides/drizzle.md) to push the schema to the database.
