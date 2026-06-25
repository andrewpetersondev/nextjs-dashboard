# Package Scripts Guide

This document explains each group of scripts defined in `package.json` and how to use them with pnpm.

## Conventions

- Run scripts with: `pnpm <script>` (or `pnpm run <script>`).
- Scripts that target a specific environment load the corresponding `.env.*.local` file via the `env:*` wrappers.

---

## Biome and Type Checking

Static analysis and formatting.

- `pnpm biome:format` — format files with Biome.
- `pnpm biome:format:check` — check formatting without writing changes.
- `pnpm biome:lint` — run Biome checks (lint + format).
- `pnpm biome:lint:fix` — run Biome checks and apply fixes.
- `pnpm biome:summary` — print a compact check report.
- `pnpm next:typegen` — generate Next.js types and run TypeScript type checking (no emit).
- `pnpm typecheck` — run TypeScript type checking only.
- `pnpm typecheck:app` — type-check the app project only (no emit).
- `pnpm typecheck:cypress` — type-check the Cypress project only (no emit).

> Biome owns JS/TS/JSON here. Markdown is handled separately — see below.

---

## Markdown (Lint and Format)

Markdown is linted by markdownlint-cli2 and formatted by dprint (Biome's Markdown support is still experimental). Config lives in `.markdownlint-cli2.jsonc` and `dprint.json`; the tools have non-overlapping rules (formatting is dprint's, content/style is markdownlint's).

- `pnpm md:lint` — lint Markdown with markdownlint-cli2 (report-only).
- `pnpm md:lint:fix` — apply markdownlint's safe autofixes.
- `pnpm md:format:check` — check Markdown formatting with dprint (no writes).
- `pnpm md:format` — format Markdown with dprint.
- `pnpm md:check` — lint + format-check together; runs inside `check` and `check:fast`.
- `pnpm md:fix` — autofix then format (markdownlint first, dprint last, so dprint has final say on whitespace).

---

## Next.js (App Lifecycle)

Build and run the app.

- `pnpm next:dev` — start Next.js in development mode (Turbopack).
- `pnpm next:dev:test` — start Next.js in development mode with the test environment (port from `PORT` in `.env.test.local`).
- `pnpm next:build` — create a production build.
- `pnpm next:build:test` — build the app using the test environment.
- `pnpm next:build:standalone` — clean and build a standalone production bundle.
- `pnpm next:build:standalone:test` — clean and build a standalone bundle with the test environment.
- `pnpm next:start` — run the production server (requires a prior build).
- `pnpm next:start:standalone` — prepare assets and start the standalone server output.
- `pnpm next:start:standalone:test` — prepare assets and start the standalone server with the test environment.
- `pnpm serve:standalone` — clean, build, and run the standalone server in one step.
- `pnpm serve:test` — clean, build, and run the standalone server using the test environment.

---

## Cypress (E2E)

End-to-end testing.

- `pnpm cy:e2e` — start the dev server (test env) and run E2E tests end-to-end.
- `pnpm cy:e2e:ci` — alias for `cy:e2e`.
- `pnpm cy:e2e:open` — open the Cypress interactive runner.
- `pnpm cy:e2e:run` — run Cypress E2E in headless mode.
- `pnpm cy:open:with-server` — boot the test-env dev server, then open the interactive runner.
- `pnpm cy:server` — start the test-env dev server only (alias for `next:dev:test`).
- `pnpm cy:preflight` — run the `/api/health` identity preflight (asserts the test env/DB).
- `pnpm cy:open` — open Cypress (general).
- `pnpm cy:run` — run Cypress (general).
- `pnpm cy:clean` — remove generated Cypress config artifacts.

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
- `pnpm db:studio:test` — open Drizzle Studio against the test database.
- `pnpm db:drift` — assert the dev/test/prod migration sets describe the same schema (the CI drift gate; no database needed).

---

## Environment Wrappers

Load a specific `.env.*.local` file before running a command.

- `pnpm env:dev <cmd>` — run `<cmd>` with the development environment.
- `pnpm env:dev:pnpm <cmd>` — run `pnpm <cmd>` with the development environment.
- `pnpm env:test <cmd>` — run `<cmd>` with the test environment.
- `pnpm env:test:pnpm <cmd>` — run `pnpm <cmd>` with the test environment.
- `pnpm env:prod <cmd>` — run `<cmd>` with the production environment.
- `pnpm env:prod:pnpm <cmd>` — run `pnpm <cmd>` with the production environment.

---

## Utilities

- `pnpm clean` — remove `.next` build output.
- `pnpm clean:all` — clean `.next`, generated files, and `node_modules` (requires reinstall).
- `pnpm clean:deps` — remove `node_modules`.
- `pnpm clean:generated` — remove generated `.js`, `.map`, and `.tsbuildinfo` files.
- `pnpm knip` — find unused exports, files, and dependencies.
- `pnpm check` — run Biome lint, Markdown check, typecheck, typegen, unit + integration tests, and E2E.
- `pnpm check:fast` — run Biome lint, Markdown check, typecheck, typegen, and the migration-drift gate (no tests/E2E).
- `pnpm check:repo` — run full `check` plus knip.
- `pnpm test` — run the unit lane (alias for `test:unit`; `vitest run --project unit`). DB-free; no test env needed.
- `pnpm test:unit` — run the unit lane once (pure/mocked, no database).
- `pnpm test:integration` — run the integration lane against the real `test_db` (loads `.env.test.local` via `env:test`).
- `pnpm test:all` — run the unit and integration lanes together.
- `pnpm test:coverage` — run the unit lane with coverage (enforces the floors in `vitest.config.ts`). No test env needed.
- `pnpm test:ui` — open the Vitest UI.
- `pnpm test:watch` — run the unit lane in watch mode.

The unit lane is database-free: it runs against a schema-valid dummy env baked into `vitest.config.ts`, so it needs
neither `.env.test.local` nor a live database. Only the integration lane (`test:integration`, and the integration half
of `test:all`) loads `.env.test.local` via `env:test` and talks to the real `test_db`. `vitest.setup.ts` registers the
global server-API mocks shared by both lanes.

---

## Typical Workflows

**Local development:**

```sh
pnpm install
pnpm db:push:dev
pnpm db:seed:dev
pnpm next:dev
```

**Prepare and run E2E locally:**

```sh
pnpm db:push:test
pnpm db:seed:test
pnpm next:build:test
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
pnpm next:dev
```

---

_Last updated: 2026-06-24_
