# Drizzle and Database

This project uses Drizzle ORM with PostgreSQL. Migrations and seeds are managed via drizzle-kit and lightweight
TypeScript CLI scripts in `devtools/`.

## Key Locations

- `database/schema/` — the Drizzle table schema (the source migrations are generated from)
- `drizzle/migrations/{dev,test,prod}/` — generated SQL migrations, one set per environment
- `drizzle.config.ts` — Drizzle Kit config (`schema` → `database/schema`, `out` → the per-env migration dir)
- `devtools/cli/*.ts` + `devtools/seed/**` — reset and seed helpers
- `src/server/db/` — the shared database connection; per-module repositories live in each module's `infrastructure/persistence/`

## Common Commands

**Generate and run migrations:**

```sh
pnpm db:push:dev    # development
pnpm db:push:test   # test
pnpm db:push:prod   # production
```

**Seed data:**

```sh
pnpm db:seed:dev
pnpm db:seed:test
pnpm db:seed:prod
```

**Reset database (destructive):**

```sh
pnpm db:reset:dev
pnpm db:reset:test
pnpm db:reset:prod
```

**Drizzle Studio:**

```sh
pnpm db:studio:dev
```

## Environment

- Ensure `DATABASE_URL` is set for the target environment (`.env.*.local` files).
- Use the `env:dev`, `env:test`, or `env:prod` script wrappers to load the correct `.env.*.local`.

## Tips

- After changing schemas, regenerate and migrate before running the app.
- Keep schema changes small and well-documented in commit messages.
- For test runs, prefer a clean seed to ensure deterministic behavior.
