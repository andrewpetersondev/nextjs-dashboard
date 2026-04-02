# Package Scripts Guide

This document explains each group of scripts defined in `package.json` and how to use them with pnpm.

## Conventions

- Run scripts with: `pnpm <script>` (or `pnpm run <script>`).
- Scripts that target a specific environment load the corresponding `.env.*.local` file via the `env:*` wrappers.

---

## Biome and Type Checking

Static analysis and formatting.

- `pnpm biome:check` — run Biome checks (lint + format).
- `pnpm biome:format` — format files with Biome.
- `pnpm biome:summary` — print a compact check report.
- `pnpm typegen` — generate Next.js types and run TypeScript type checking (no emit).
- `pnpm typecheck` — run TypeScript type checking only.

---

## Next.js (App Lifecycle)

Build and run the app.

- `pnpm dev` — start Next.js in development mode (Turbopack).
- `pnpm build` — create a production build.
- `pnpm build:test` — build the app using the test environment.
- `pnpm start` — run the production server (requires a prior build).
- `pnpm start:standalone` — prepare assets and start the standalone server output.
- `pnpm serve:standalone` — clean, build, and run the standalone server in one step.
- `pnpm serve:test` — start the standalone server using the test environment.

---

## Cypress (E2E)

End-to-end testing.

- `pnpm cy:e2e:open` — open the Cypress interactive runner.
- `pnpm cy:e2e:run` — run Cypress E2E in headless mode.

---

## Database (Drizzle)

Migrations, seeding, and resets per environment.

- `pnpm db:push:dev` — generate and apply migrations (development).
- `pnpm db:push:test` — generate and apply migrations (test).
- `pnpm db:push:prod` — generate and apply migrations (production).
- `pnpm db:seed:dev` — seed the development database.
- `pnpm db:seed:test` — seed the test database.
- `pnpm db:seed:prod` — seed the production database.
- `pnpm db:reset:dev` — drop, recreate, and seed the development database.
- `pnpm db:reset:test` — drop, recreate, and seed the test database.
- `pnpm db:reset:prod` — drop, recreate, and seed the production database.
- `pnpm db:studio:dev` — open Drizzle Studio against the development database.

---

## Environment Wrappers

Load a specific `.env.*.local` file before running a command.

- `pnpm env:dev <cmd>` — run `<cmd>` with the development environment.
- `pnpm env:test <cmd>` — run `<cmd>` with the test environment.
- `pnpm env:prod <cmd>` — run `<cmd>` with the production environment.

---

## Utilities

- `pnpm clean` — remove `.next` build output.
- `pnpm clean:all` — remove `.next` and `node_modules` (requires reinstall).
- `pnpm knip` — find unused exports, files, and dependencies.
- `pnpm test` — run unit/integration tests (Vitest).

---

## Typical Workflows

**Local development:**

```sh
pnpm install
pnpm db:push:dev
pnpm db:seed:dev
pnpm dev
```

**Prepare and run E2E locally:**

```sh
pnpm db:push:test
pnpm db:seed:test
pnpm build:test
pnpm serve:test   # keep running in a separate terminal
pnpm cy:e2e:open
```

**One-shot E2E run:**

```sh
pnpm cy:e2e:run
```

**Reset dev database and start fresh:**

```sh
pnpm db:reset:dev
pnpm dev
```

---

_Last updated: 2026-03-03_
