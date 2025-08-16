# Drizzle Kit 

## Migrations

Drizzle Kit provides a migration system that allows you to manage your database schema changes over time. Migrations are written in JavaScript and can be executed using the Drizzle CLI.

## Commands

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
pnpm drizzle-kit push
pnpm drizzle-kit pull
pnpm drizzle-kit check
pnpm drizzle-kit up
pnpm drizzle-kit studio
```
### Two Strategies for Migrations

1. **generate** then **migrate**:  
   - Use `drizzle-kit generate` to create migration files based on your Drizzle schema.  
   - Use `drizzle-kit migrate` to apply these migrations to your database.
2. **push**:  
   - Use `drizzle-kit push` to push your Drizzle schema to the database, creating the necessary tables and columns. 
   - This is useful if for development purposes because it allows you to quickly set up your database schema without manually writing migration files. Or destroy and recreate the database schema from scratch.
  

### Drizzle Kit Command Overview

**`drizzle-kit generate`**  
- Generates SQL migration files based on your Drizzle schema, either upon declaration or after subsequent changes.  

**`drizzle-kit migrate`**  
- Applies generated SQL migration files to your database.  

**`drizzle-kit pull`**  
- Introspects your database schema, converts it to a Drizzle schema, and saves it to your codebase.  

**`drizzle-kit push`**  
- Pushes your Drizzle schema to the database, either upon declaration or after schema changes.  

**`drizzle-kit studio`**  
- Connects to your database and starts a proxy server for Drizzle Studio, enabling convenient database browsing.  

**`drizzle-kit check`**  
- Checks all generated migrations for race conditions or collisions.  

**`drizzle-kit up`**  
- Upgrades snapshots of previously generated migrations.  
