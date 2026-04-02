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

Create the appropriate `.env` files at the project root. Common files:

- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

Minimal variables (adjust to your setup):

```
DATABASE_URL=postgres://user:pass@localhost:5432/nextjs_dashboard
SESSION_SECRET=change-me
NODE_ENV=development
```

## 3. Prepare the Database

Run migrations and seeds for your target environment.

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

See [docs/guides/testing.md](testing.md) for the full E2E workflow.

## Tips

- If you see build anomalies, try `pnpm clean` then `pnpm next:build`.
- Ensure `DATABASE_URL` points to a reachable database and that migrations have run.
- Auth requires `SESSION_SECRET` to be set and consistent across processes.
