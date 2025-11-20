# Drizzle and Database

This project uses Drizzle ORM with PostgreSQL. Migrations and seeds are managed via drizzle-kit and lightweight TS CLI scripts in devtools/.

Key locations
- drizzle/ — generated SQL, migrations, and meta
- drizzle.config.ts — Drizzle Kit configuration
- devtools/cli/*.ts — reset and seed helpers
- src/server/** — server-side DB access (repositories/services)

Common commands
- Generate and run migrations (development):
  - pnpm db:generate:migrate:dev
- Generate and run migrations (test):
  - pnpm db:generate:migrate:test
- Generate and run migrations (production):
  - pnpm db:generate:migrate:prod
- Seed data:
  - pnpm db:seed:dev | pnpm db:seed:test | pnpm db:seed:prod
- Reset database (destructive):
  - pnpm db:reset:dev | pnpm db:reset:test | pnpm db:reset:prod
- Studio (Drizzle Kit):
  - pnpm db:studio:dev

Environment
- Ensure DATABASE_URL is set for the target environment (.env.*.local files).
- Use env:dev, env:test, env:prod script wrappers to load the correct .env.*.local.

Tips
- After changing schemas, regenerate and migrate before running the app.
- Keep schema changes small and well-documented in commit messages.
- For test runs, prefer a clean seed to ensure deterministic behavior.
