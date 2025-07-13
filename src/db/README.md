# db

This folder contains all database-related code for the application.

## Structure

- `connection.ts` – Shared database connection logic.
- `dev-database.ts` – **For Drizzle Kit development operations only.** Connects to the development database using Drizzle ORM.
- `test-database.ts` – **For Drizzle Kit test operations only.** Connects to the test database using Drizzle ORM.
- `schema.ts` – Database schema definitions for Drizzle ORM.
- `migrations/` – Database migration files, organized by environment.
- `models/` – Database entity models, one per table.
- `seeds/` – Seed scripts for populating development and test databases.

## Usage

- **Never use `dev-database.ts` or `test-database.ts` in production code.**  
  These files are only for Drizzle Kit CLI operations (e.g., generating migrations, seeding).
- All database access in the application should use the shared connection logic in `connection.ts`.

## Security

- All database credentials are managed via environment variables and Hashicorp Vault.
- Never commit secrets or sensitive data.

## Documentation

- All models and utilities are documented with TSDoc.
- See each file for further details.
