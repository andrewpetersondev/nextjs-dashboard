# Package Scripts Guide

This document explains each group of scripts defined in package.json and how to use them with pnpm.

## Conventions

- Run scripts with: `pnpm run <script>` (or `pnpm <script>` for short).
- Some scripts assume a test environment file `.env.test` is present.

---

## Biome and Type Checking

Static analysis and formatting.

- biome-check  
  Formats code and runs Biome checks, showing up to 100 diagnostics.
    - Use: `pnpm biome-check`

- biome-check-write  
  Fixes issues Biome can auto-correct.
    - Use: `pnpm biome-check-write`

- biome-format  
  Formats files with Biome.
    - Use: `pnpm biome-format`

- biome-summary  
  Prints a compact check report.
    - Use: `pnpm biome-summary`

- type-gen  
  Generates Next.js types and runs TypeScript type checking (no emit).
    - Use: `pnpm type-gen`

---

## Next.js (App lifecycle)

Build and run the app.

- dev  
  Start Next.js in development mode (Turbopack).
    - Use: `pnpm dev`

- build  
  Create a production build (Turbopack).
    - Use: `pnpm build`

- start  
  Run the production server (expects a prior build).
    - Use: `pnpm start`

- standalone  
  Clean build artifacts, build, and run the standalone server.
    - Use: `pnpm standalone`

- start-standalone  
  Prepare assets and start the standalone server output.
    - Use: `pnpm start-standalone`

- debug  
  Start dev server with Node inspector on port 9229.
    - Use: `pnpm debug`

---

## Cypress (E2E)

End-to-end testing workflow.

- clean  
  Clean Cypress artifacts and Next.js build output.
    - Use: `pnpm clean`

- cyp-open  
  Open Cypress interactive runner.
    - Use: `pnpm cyp-open`

- cyp-e2e-headless  
  Run Cypress E2E in headless mode.
    - Use: `pnpm cyp-e2e-headless`

- cyp-test-e2e  
  Generate and run test DB migrations, then run headless E2E.
    - Use: `pnpm cyp-test-e2e`

---

## Test-focused (dotenv + wait-on)

Build and run the app under the test environment, then run Cypress.

- build:test  
  Build the app using `.env.test`.
    - Use: `pnpm build:test`

- serve:test  
  Start the standalone server using `.env.test`.
    - Use: `pnpm serve:test`

- wait:health  
  Wait until the app responds (default http://localhost:3100/).
    - Use: `pnpm wait:health`

- e2e:run  
  Run Cypress E2E using `.env.test`.
    - Use: `pnpm e2e:run`

- e2e:ci  
  One-shot CI flow: build → start (in background) → wait → run E2E → stop server.
    - Use: `pnpm e2e:ci`

- e2e:open  
  Interactive variant: build → start (in background) → wait → open Cypress; cleans up on exit.
    - Use: `pnpm e2e:open`

---

## Database (Drizzle)

Database migrations, seeding, and resets for dev/test.

- db-reset-dev  
  Drop/recreate and seed the development DB.
    - Use: `pnpm db-reset-dev`

- db-reset-test  
  Drop/recreate and seed the test DB.
    - Use: `pnpm db-reset-test`

- db-truncate-dev  
  Truncate dev DB tables (fast reset), then seed minimal data.
    - Use: `pnpm db-truncate-dev`

- db-truncate-test  
  Truncate test DB tables (fast reset), then seed minimal data.
    - Use: `pnpm db-truncate-test`

- db-migrate-generate-test  
  Generate migrations and apply them for the test DB.
    - Use: `pnpm db-migrate-generate-test`

- db-seed-dev  
  Seed the development DB.
    - Use: `pnpm db-seed-dev`

- db-seed-test  
  Seed the test DB.
    - Use: `pnpm db-seed-test`

---

## Utilities

Miscellaneous helpers.

- wait:health  
  Wait for the local server to be available (useful in scripts before E2E).
    - Use: `pnpm wait:health`

- db-create  
  Example command to create a test database inside a running Docker Postgres container. Replace `{your_postgres_user}`
  before running.
    - Use: `pnpm db-create`

- create-auth-secret  
  Generate an auth secret (via `pnpm dlx`).
    - Use: `pnpm create-auth-secret`

---

## Typical Workflows

- Local development
    1) `pnpm install`
    2) `pnpm dev`

- Prepare and run E2E against a production build
    1) `pnpm build:test`
    2) `pnpm serve:test` (in background)
    3) `pnpm wait:health`
    4) `pnpm e2e:run`

- One-shot E2E in CI
    - `pnpm e2e:ci`

- Reset dev DB and start fresh
    - `pnpm db-reset-dev` then `pnpm dev`

---

_Last updated: 2025-10-04_  
_Author: GitHub Copilot_
