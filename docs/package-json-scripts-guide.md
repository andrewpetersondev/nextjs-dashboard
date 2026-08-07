# Package Scripts Guide

This document explains each group of scripts defined in `package.json` and how to use them with pnpm.

## Conventions

- Run scripts with: `pnpm <script>` (or `pnpm run <script>`).
- Scripts that target a specific environment load the corresponding `.env.*.local` file via the `env:*` wrappers.
- Composite scripts chain with `&&`, so the **first failure stops the rest**. Four (`lint`, `fix`,
  `md:check`, `md:fix`) deliberately do not — see [Slash-command parity](#slash-command-parity).

---

## Slash-command parity

Every project slash command in `.claude/commands/` runs the pnpm script of **the same name**: `/lint` runs
`pnpm lint`, `/check` runs `pnpm check`, `/test` runs `pnpm test`. Where a script name contains a colon the
command substitutes a hyphen — `/check-fast` runs `pnpm check:fast` — because `:` is reserved for plugin
namespacing in the command palette (`/engineering:architecture`).

Two commands are exempt, because they are workflows with no script equivalent: **`/ship`** and
**`/clean-worktrees`**. Nothing else may take the name of a script it does not run.

`coverage`, `e2e`, `fix`, and `lint` exist purely to hold that invariant. They are one-line aliases so the
command's recipe lives in `package.json` — one source of truth — instead of being duplicated in Markdown,
where it silently drifts when the toolchain changes.

`lint`, `fix`, `md:check`, and `md:fix` use `cmd-a || r=1; cmd-b || r=1; exit ${r:-0}` rather than `&&`.
All four are multi-tool commands where you want **every** tool to run: with `&&`, one Biome error would
skip the Markdown half entirely (so `/lint` would under-report and `/fix` would leave Markdown
unformatted), and inside the Markdown pair an unfixable markdownlint error would skip dprint the same
way. (`biome check --write` exits non-zero whenever unfixable diagnostics remain, so this is the normal
case, not an edge case.) The idiom still exits non-zero if either half failed — it suppresses the
short-circuit, not the signal.

---

## Biome and Type Checking

Static analysis and formatting.

- `pnpm biome:format` — format files with Biome.
- `pnpm biome:format:check` — check formatting without writing changes.
- `pnpm biome:lint` — run Biome checks (lint + format).
- `pnpm biome:lint:fix` — run Biome checks and apply fixes.
- `pnpm biome:summary` — print a compact check report.
- `pnpm lint` — Biome **and** Markdown, report-only; runs both halves even if the first fails (backs `/lint`).
- `pnpm fix` — Biome **and** Markdown autofixes; runs both halves even if the first fails (backs `/fix`).
- `pnpm next:typegen` — generate Next.js route types (run before `typecheck` so it validates against fresh output).
- `pnpm typecheck` — run TypeScript type checking (no emit) over both projects: app then Cypress.
- `pnpm typecheck:app` — the app project only (`tsc -b tsconfig.json`).
- `pnpm typecheck:cypress` — the Cypress project only, via `cypress/tsconfig.typecheck.json` (the
  `baseUrl`-free variant of `cypress/tsconfig.json`; TS7 errors on `baseUrl`, which the webpack
  preprocessor still needs — see the comments in both files).

> Biome owns JS/TS/JSON/CSS here. Markdown is handled separately — see below.

---

## Markdown (Lint and Format)

Markdown is linted by markdownlint-cli2 and formatted by dprint (Biome's Markdown support is still experimental). Config lives in `.markdownlint-cli2.jsonc` and `dprint.json`; the tools have non-overlapping rules (formatting is dprint's, content/style is markdownlint's).

- `pnpm md:lint` — lint Markdown with markdownlint-cli2 (report-only).
- `pnpm md:lint:fix` — apply markdownlint's safe autofixes.
- `pnpm md:format:check` — check Markdown formatting with dprint (no writes).
- `pnpm md:format` — format Markdown with dprint.
- `pnpm md:check` — lint + format-check together; both halves run even if the first fails. Runs inside
  `check` and `check:fast`.
- `pnpm md:fix` — autofix then format (markdownlint first, dprint last, so dprint has final say on
  whitespace); dprint still runs when markdownlint reports unfixable issues.

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
- `pnpm e2e` — alias for `cy:e2e` (backs `/e2e`).
- `pnpm cy:e2e:open` — open the Cypress interactive runner against an **already-running** server
  (runs the identity preflight first; it does not boot anything). `cy:open` is its alias.
- `pnpm cy:e2e:run` — run specs headless against an **already-running** server (identity preflight
  first; it does not boot anything). `cy:run` is its alias.
- `pnpm cy:open:with-server` — boot the test-env dev server, then open the interactive runner.
- `pnpm cy:server` — start the test-env dev server only (alias for `next:dev:test`).
- `pnpm cy:preflight` — run the `/api/health` identity preflight (asserts the test env/DB).
- `pnpm cy:clean` — remove generated Cypress config artifacts.

> Only `cy:e2e` (and its `e2e` alias) and `cy:open:with-server` start a server.
> Everything else assumes one is already listening and fails the preflight if it is not.

---

## Database (Drizzle)

Migrations, seeding, and resets per environment.

- `pnpm db:push:dev` — generate and apply migrations (development).
- `pnpm db:push:test` — generate and apply migrations (test).
- `pnpm db:push:prod` — generate and apply migrations (production).
- `pnpm db:generate:{dev,test,prod}` — generate migration SQL only (the first half of `db:push:*`);
  output is routed per environment by `DATABASE_ENV`, see `drizzle.config.ts`.
- `pnpm db:migrate:{dev,test,prod}` — apply already-generated migrations (the second half).
- `pnpm db:seed:dev` — seed the development database.
- `pnpm db:seed:test` — seed the test database.
- `pnpm db:seed:prod` — seed the production database (requires `CONFIRM_PROD_DB=yes`).
- `pnpm db:reset:dev` — **empty every table** in the development database (drizzle-seed's `reset`,
  i.e. `TRUNCATE … CASCADE`). Tables and applied migrations survive; rows do not. It does **not**
  drop, recreate, or re-seed — follow with `pnpm db:seed:dev`.
- `pnpm db:reset:test` — the same for the test database; follow with `pnpm db:seed:test`.
- `pnpm db:reset:prod` — the same for the production database (requires `CONFIRM_PROD_DB=yes`).
- `pnpm db:seed` / `pnpm db:reset` — the env-less base scripts the `:dev`/`:test`/`:prod` variants
  wrap. Prefer the wrappers; running these bare uses whatever environment is already loaded.
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

- `pnpm clean` — remove `.next` build output **and** run `clean:generated` (a repo-wide glob delete
  of `.js`, `.map`, and `.tsbuildinfo`). Not `.next`-only despite the name.
- `pnpm clean:all` — clean `.next`, generated files, and `node_modules` (requires reinstall).
- `pnpm clean:deps` — remove `node_modules`.
- `pnpm clean:generated` — remove generated `.js`, `.map`, and `.tsbuildinfo` files.
- `pnpm knip` — find unused exports, files, and dependencies.
- `pnpm check` — run Biome lint, Markdown check, typegen, typecheck, the migration-drift gate, the
  knip dead-code gate, unit + integration tests, and E2E (everything `check:fast` runs, plus knip and
  all three test lanes).
- `pnpm check:fast` — run Biome lint, Markdown check, typegen, typecheck, and the migration-drift gate (no knip, no tests/E2E).
- `pnpm csp:guard` — assert the enforced Content-Security-Policy on a running server (nonce-CSP
  breakage is silent and screenshot-proof, so this is its own gate).
- `pnpm csp:guard:build` — `next:build` then `csp:guard`. This is the CI `csp` job: it is the only
  check that sees the real enforced CSP, because Cypress strips the header and `next dev` never
  prerenders.
- `pnpm test` — run the unit lane (alias for `test:unit`; `vitest run --project unit`). DB-free; no test env needed.
- `pnpm test:unit` — run the unit lane once (pure/mocked, no database).
- `pnpm test:integration` — run the integration lane against the real `test_db` (loads `.env.test.local` via `env:test`).
- `pnpm test:all` — run the unit and integration lanes together.
- `pnpm test:coverage` — run the unit lane with coverage (enforces the floors in `vitest.config.ts`). No test env needed.
- `pnpm coverage` — alias for `test:coverage` (backs `/coverage`).
- `pnpm test:ui` — open the Vitest UI (unit lane only; the integration lane needs `.env.test.local` loaded, so run it via `test:integration`).
- `pnpm test:watch` — run the unit lane in watch mode.
- `pnpm smoke:prod` — probe the **live deployment**: health + database, landing page, the unauthenticated-dashboard
  redirect, and a real seeded USER/ADMIN login whose dashboards must render. Writes nothing. Exits 1 on failure.
- `pnpm smoke:prod --demo` — the above plus the one-click demo button. **Writes**: one permanent demo user and one
  `demo_user_counters` row per run, so keep this weekly rather than daily.
- `pnpm smoke:prod:csp` — point the existing CSP guard at the live deployment instead of a local `next start`.

The `smoke:prod*` scripts target production, not localhost, and are the only checks here that observe the deployed
artifact rather than the code. They are driven by the `prod-watchdog` scheduled agent — see
[`prod-watchdog-routine.md`](prod-watchdog-routine.md). Override the target with `PROD_SMOKE_BASE_URL` to probe a
preview deployment instead.

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

**Prepare and run E2E locally** (interactive runner against a server you control):

```sh
pnpm db:push:test
pnpm db:seed:test
pnpm serve:test   # keep running in a separate terminal
pnpm cy:e2e:open
```

`serve:test` cleans and builds before starting, so a separate `next:build:test` first would just be
thrown away.

**One-shot E2E run** (boots and tears down its own test server):

```sh
pnpm e2e
```

**Reset dev database and start fresh:**

```sh
pnpm db:reset:dev
pnpm db:seed:dev
pnpm next:dev
```

`db:reset:*` only truncates — without the seed step the app starts against empty tables. Reset-then-seed
is the supported order; `db:seed` refuses to run against a non-empty database.

---

_Last updated: 2026-08-05_
