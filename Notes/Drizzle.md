# Drizzle

> Drizzle ORM runs SQL queries on your database via database drivers.
> **Under the hood Drizzle will create a node-postgres driver instance which you can access via db.$client if necessary.**
> 


## Links
[node-postgres](https://node-postgres.com/)

[node-postgres repo](https://github.com/brianc/node-postgres)

[quick start guide](https://orm.drizzle.team/docs/get-started/postgresql-new)


## Basics

>- Drizzle is an ORM for  **PostgreSQL** Database
>- My **database** is in a **Docker Container**
>- **locations** of files is irrelevant

>My project the uses the following **packages**:
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


## DB Connection

Step 1: Install packages

```shell
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

Step 2: Initialize the DRIVER and Make A Query

**Option 1: Node-Postgres (use this if possible)**
```ts
// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL!);
 
const result = await db.execute('select 1');

```

Option  2: Node-Postgres with Config
```ts
// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';

// You can specify any property from the node-postgres connection options
export const db = drizzle({ 
  connection: { 
    connectionString: process.env.DATABASE_URL!,
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
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool });
 
const result = await db.execute('select 1');

```

## When would I use the "Existing Driver" Example above?

[Answer](AI-Answer.md)

##  Creating Database

Config, Create schema, then use Drizzle Kit CLI tools.

### Config
```ts
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
   out: "./drizzle",
   schema: "./src/db/schema.ts",
   dialect: "postgresql",
   dbCredentials: {
      url: process.env.DATABASE_URL!,
   },
   verbose: true, // optional
   strict: true,  // optional
});
```

### Schema
Example for Users
```ts
// ./src/db/schema/users.ts
import {integer, pgTable, varchar, text, uuid, date} from "drizzle-orm/pg-core";
export const users = pgTable("users", {
   id: uuid("id").defaultRandom().primaryKey(),
   name: varchar({ length: 255 }).notNull(),
   email: text("email").notNull().unique(),
   password: text("password").notNull(),
});
```
Question: Is password supposed to be text()?
Question: 

## Migrations

Database migrations are an essential part of maintaining and updating a database schema in any application. When working with **Drizzle ORM** and **PostgreSQL**, migrations are handled in a way that integrates tightly with Drizzle's schema definitions and allows developers to perform changes (like creating tables, altering columns, etc.) safely and programmatically.

> What Are Migrations? 

Migrations are a way to programmatically define changes to the database schema. This allows developers to:
1. **Version control schema changes** (e.g., adding/removing tables, altering columns, etc.).
2. **Collaborate with others** by maintaining a shared evolution history of the schema.
3. **Roll back changes** if something goes wrong, ensuring stability.
4. Keep schemas **synchronized** between development, staging, and production environments.

In the context of **Drizzle ORM**, migrations allow you to define your database schema programmatically in your application, and any changes to the schema can be applied to the actual database using migration scripts.

> Drizzle ORM + PostgreSQL: Schema-First Approach
Drizzle ORM adopts a **schema-first approach**, which means you define your database schema using TypeScript code, and migrations are generated/managed based on these definitions.

### Steps for Handling Migrations
1. **Define the Schema:** First, define your schema using Drizzle’s schema-building functions. This includes defining tables, columns, relationships, etc.
2. **Initialize the Migration Setup:** For projects using Drizzle ORM, you’ll typically use the **`drizzle-kit`** package to manage migrations. Ensure you’ve configured Drizzle to connect to your PostgreSQL database. 
   1. Steps:
      - Install Drizzle-related packages:
      - Set up your database connection. 
      - Create a **config file** for Drizzle Kit (e.g., `drizzle.config.ts`).
3. **Generate Migrations:** When you've made changes to your schema definitions, use Drizzle Kit to generate a migration file. The migration file contains the SQL queries to apply the changes to the actual PostgreSQL database. 
```shell
drizzle-kit generate:pg --out ./drizzle/migrations
```
This command will:
- Compare the current database schema with your Drizzle schema definitions. 
- Generate a new migration file containing the SQL necessary to sync the database schema with the definitions.

4. **Apply Migrations to the Database:** Migrations are applied using the `drizzle-kit push` command. This updates 
your PostgreSQL database schema based on the changes described in the migration file.
   Example:
``` bash
   drizzle-kit push:pg
```
5. **Versioning and Tracking Migrations:** The migration files generated by Drizzle are timestamped or incrementally 
named, ensuring each change is versioned. Drizzle ORM creates a metadata table in PostgreSQL to track which migrations have already been applied.


### Drizzle Kit CLI Tools for Migration Management

> Schema has to be managed. Choose **Database first** or **Codebase first** method. If working on a solo project, 
> then a codebase first method would be to manage schema in typescript file.   

```shell
# use this have drizzle handle everything
npx drizzle-kit push
```