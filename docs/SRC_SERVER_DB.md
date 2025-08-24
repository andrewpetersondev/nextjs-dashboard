# Database module (src/db)

This folder contains all database-related code used by the application and CLI tooling.

## Structure (current)

- connection.ts – Shared database connection factory for application runtime (uses env-configured URLs).
- db-dev.ts – For Drizzle Kit development operations only (CLI tooling). Do not import in runtime code.
- db-test.ts – For Drizzle Kit test operations only (CLI tooling). Do not import in runtime code.
- schema.ts – Database schema definitions using Drizzle ORM.
- seeds/ – Seed and reset scripts for populating or clearing databases.
  - seeds/seed.ts – Main seed script for this project (targets the test database by default).
  - seeds/reset-test.ts – Resets all tables in the test database using drizzle-seed.
  - seeds/reset-dev.ts – Resets all tables in the dev database using drizzle-seed.
  - seeds/best-seed-\*.ts – Alternative/experimental seed scripts (not the default path).

Note: Older references to folders like migrations/ or models/ are not applicable here and have been removed to avoid confusion.

## Current environment

- Active database for seeding: test_db (configured via the POSTGRES_URL_TESTDB environment variable).
- Main seed entrypoint: src/db/seeds/seed.ts (uses the test connection from db-test.ts).

## Environment variables

- POSTGRES_URL – Development database connection URL (used by db-dev.ts and connection.ts when type="dev").
- POSTGRES_URL_TESTDB – Test database connection URL (used by seed.ts, reset-test.ts, and connection.ts when type="test").
- SEED_RESET – When set to "true", seed.ts will TRUNCATE all tables and reseed even if data exists.

Credentials are managed via environment variables and Hashicorp Vault. Never commit secrets.

## Seeding the test database (test_db)

Prerequisites:

- Ensure POSTGRES_URL_TESTDB is set (in your shell or .env) to point to your test_db instance.

Run a normal seed:

- pnpm ts-node src/db/seeds/seed.ts

Force re-seed (truncate first):

- SEED_RESET=true pnpm ts-node src/db/seeds/seed.ts

Behavior:

- The script exits early if the database is not empty unless SEED_RESET=true is set.
- The script writes to the test database only (via nodeEnvTestDb from db-test.ts).

## Resetting databases (CLI)

- Test DB: pnpm ts-node src/db/seeds/reset-test.ts
- Dev DB: pnpm ts-node src/db/seeds/reset-dev.ts

## Application runtime usage

- Do not import db-dev.ts or db-test.ts from runtime code.
- Use getDB() from connection.ts to obtain a typed Drizzle instance. Default is type="test" to align with this project’s setup.

## Verification tips

After seeding, you can verify data with quick queries (psql, console, or your DB client):

- SELECT COUNT(\*) FROM users;
- SELECT COUNT(\*) FROM customers;
- SELECT COUNT(\*) FROM invoices;
- SELECT COUNT(\*) FROM revenues;

## Documentation notes

- Source files in this folder include TSDoc and inline comments for clarity.
- See each file for details and rationale; seed.ts documents its behavior and idempotency guarantees.
