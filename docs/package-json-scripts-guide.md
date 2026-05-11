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

---

## Next.js (App Lifecycle)

Build and run the app.

- `pnpm next:dev` — start Next.js in development mode (Turbopack).
- `pnpm next:dev:test` — start Next.js in development mode on port 3001 with the test environment.
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
- `pnpm check` — run lint, typecheck, typegen, tests, and E2E.
- `pnpm check:fast` — run lint, typecheck, and typegen only.
- `pnpm check:repo` — run full check plus knip.
- `pnpm test` — run unit/integration tests (Vitest) with the test environment.
- `pnpm test:coverage` — run tests with coverage using the test environment.
- `pnpm test:ui` — open Vitest UI with the test environment.
- `pnpm test:watch` — run Vitest in watch mode with the test environment.

Vitest environment variables are loaded by the `test:*` scripts via `env:test`; `vitest.setup.ts` only registers global
test mocks. If DB-backed integration tests continue to run in the same `pnpm test` command as unit tests, revisit Vitest
`coverage`, `pool`/isolation, and explicit integration-test behavior so the default test command remains predictable.

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

_Last updated: 2026-04-02_
