# Drizzle

Drizzle ORM runs SQL queries on your database via database drivers.

**Under the hood Drizzle will create a node-postgres driver instance which you can access via db.$client if necessary.**

## Links
[node-postgres](https://node-postgres.com/)

[node-postgres repo](https://github.com/brianc/node-postgres)

[quick start guide](https://orm.drizzle.team/docs/get-started/postgresql-new)



## Project Setup

- Drizzle is an ORM for  **PostgreSQL** Database
- My **database** is in a **Docker Container**
- **locations** of files is irrelevant

My project the uses the following **packages**:
1. drizzle-orm
   1. library
2. drizzle-orm/node-postgres
   1. this shows I use **node-postgres driver** and need to configure app to work with this  specific driver
3. pg
   1. node-postgres library
4. dotenv
   1. library 
5. drizzle-kit
   1. CLI for managing schemas, migrations, etc
6. tsx
   1. CLI  tool for running scripts
7. @types/pg
   1. implements type-safety


## How to setup project

Step 1: Install packages

```shell
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

Step 2: Initialize the DRIVER and Make A Query

Option 1: Node-Postgres
```ts
// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL);
 
const result = await db.execute('select 1');

```

Option  2: Node-Postgres with Config
```ts
// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';

// You can specify any property from the node-postgres connection options
const db = drizzle({ 
  connection: { 
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});
 
const result = await db.execute('select 1');

```

If I need to provide existing driver do the following.
```ts
// Make sure to install the 'pg' package 
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });
 
const result = await db.execute('select 1');

```

## When would I use the "Existing Driver" Example above?

[Answer](AI-Answer.md)

##  Creating Database

Create schema, then use Drizzle Kit CLI tools.

```shell
# use this have drizzle handle everything
npx drizzle-kit push
```