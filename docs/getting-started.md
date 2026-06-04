# Getting Started

This guide helps you set up, run, and develop the Next.js Dashboard locally.

## Prerequisites

- Node >= 24
- PNPM >= 10.12
- PostgreSQL (local or remote)

## 1. Install Dependencies

```sh
pnpm install
```

## 2. Configure Environment

Copy [`.env.example.local`](../.env.example.local) to one file per environment, then fill in real values:

- `.env.development.local` — `DATABASE_ENV=development`, `DATABASE_URL` ending in `/dev_db`
- `.env.test.local` — `DATABASE_ENV=test`, `DATABASE_URL` ending in `/test_db`
- `.env.production.local` — `DATABASE_ENV=production`, `DATABASE_URL` ending in `/prod_db`

At minimum each file needs a reachable `DATABASE_URL` and a `SESSION_SECRET`; see the example for the full list.

## 3. Prepare the Database

First, stand up PostgreSQL and create the per-environment databases — see [database-setup.md](database-setup.md). If you already have a database, make sure your `DATABASE_URL` points at it.

Then run migrations and seeds for your target environment.

**Development:**

```sh
pnpm db:push:dev
pnpm db:seed:dev
```

**Test:**

```sh
pnpm db:push:test
pnpm db:seed:test
```

**Production:**

```sh
pnpm db:push:prod
pnpm db:seed:prod
```

## 4. Start the App

**Development (Turbopack):**

```sh
pnpm next:dev
```

**Production-like (standalone build):**

```sh
pnpm serve:standalone
```

Or, if already built:

```sh
pnpm next:start:standalone
```

## 5. Running Tests

```sh
pnpm next:build:test # Build with test env
pnpm serve:test      # Serve with test env
pnpm cy:e2e:open        # Open Cypress interactive runner
pnpm cy:e2e:run  # Run Cypress headless
```

See [testing.md](testing.md) for the full E2E workflow.

## Tips

- If you see build anomalies, try `pnpm clean` then `pnpm next:build`.
- Ensure `DATABASE_URL` points to a reachable database and that migrations have run.
- Auth requires `SESSION_SECRET` to be set and consistent across processes.
