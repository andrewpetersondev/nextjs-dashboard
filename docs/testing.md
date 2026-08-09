# Testing

The dashboard has three test lanes. The **unit** lane is database-free and runs
anywhere; the **integration** and **E2E** lanes talk to the real `test_db` under
the **test environment** (`.env.test.local`):

| Lane        | Tool    | Command                 | What it covers                                                | Needs `test_db`? | Runs in CI?         |
| ----------- | ------- | ----------------------- | ------------------------------------------------------------- | ---------------- | ------------------- |
| Unit        | Vitest  | `pnpm test`             | Pure logic, mappers, services — dependencies mocked           | No               | Yes — `check` job   |
| Integration | Vitest  | `pnpm test:integration` | Full-stack flows through the layers against the real database | Yes              | Yes — `integration` |
| End-to-end  | Cypress | `pnpm cy:e2e`           | The running app in a real browser, including accessibility    | Yes              | Yes — `e2e` job     |

All three run on every push to `main`. The integration lane joined CI on
2026-08-04; before that it ran on developer machines only, so a break in it could
reach `main` unnoticed. Note that `pnpm check:fast` still does **not** cover it —
it needs a database — so CI is its only automatic gate.

`pnpm test` is an alias for `pnpm test:unit` (unit only); `pnpm test:all` runs the
unit and integration lanes together.

Before running the integration or E2E lanes, make sure the **test database** exists
and is migrated — see [database-setup.md](database-setup.md). The unit lane needs
neither a database nor `.env.test.local`: it runs against a schema-valid dummy env
baked into [`vitest.config.ts`](../vitest.config.ts).

## Unit & integration tests (Vitest)

Config: [`vitest.config.ts`](../vitest.config.ts) · setup: [`vitest.setup.ts`](../vitest.setup.ts)

```sh
pnpm test             # unit lane, run once (no database needed)
pnpm test:watch       # unit lane, re-run on change
pnpm test:ui          # Vitest UI (unit lane — integration needs .env.test.local via test:integration)
pnpm test:coverage    # unit lane once, with coverage (enforces the floors)
pnpm test:integration # integration lane against the real test_db
pnpm test:all         # unit + integration
```

**Where tests live** — beside the code they cover, in `__tests__/` folders:

- `__tests__/unit/…` — pure logic with dependencies mocked. No database needed.
- `__tests__/integration/…` — exercise multiple layers together (presentation →
  application → infrastructure → DB). **These connect to the real `test_db`**, so
  Postgres must be running and migrated (`pnpm db:push:test`) before
  `pnpm test:integration` (or `pnpm test:all`).

**Conventions:**

- Test files are named `*.test.ts` / `*.spec.ts`, anywhere under `src/`.
- **Import test APIs explicitly** — `import { describe, expect, it, vi } from "vitest"`.
  `globals` is **not** enabled; a file that omits the import fails to load with
  `ReferenceError: describe is not defined`.
- The environment is `node`; Next.js server APIs (`next/navigation`, `next/cache`,
  `next/headers`, and the `server-only` guard) are mocked centrally in
  `vitest.setup.ts`, so server modules import cleanly in tests.

## End-to-end tests (Cypress)

Config: [`cypress.config.ts`](../cypress.config.ts) · specs: `cypress/e2e/**/*.cy.ts` ·
support: `cypress/support/e2e.ts`. Cypress v15, wired up with
`@testing-library/cypress` and `cypress-axe`.

For how the suite is built — the two-process (browser ↔ Node task) model, the
database reset/seed lifecycle, custom commands, and known rough edges — see
[`cypress/README.md`](../cypress/README.md).

**What to cover** — [`checklist.md`](../cypress/e2e/checklist.md) is a practical
guide to the E2E paths worth having as the suite grows: smoke + auth, CRUD,
resilience, accessibility, and Cypress hygiene.

**The easy way — one command (boots the server for you):**

```sh
pnpm cy:e2e               # headless: start dev server (test env), run specs, exit
pnpm cy:open:with-server  # interactive: same, but opens the Cypress runner
```

These use `start-server-and-test` to launch `next:dev:test`, wait for it to come
up, then run Cypress — no second terminal needed.

**Manual — if the app is already running:**

```sh
pnpm cy:server      # terminal 1: start the test-env dev server
pnpm cy:e2e:open    # terminal 2: open the runner …
pnpm cy:e2e:run     # … or run headless
```

For a production-like target, run `pnpm serve:test` (standalone build) instead of
`cy:server`.

Both manual commands run the `/api/health` **identity preflight** first (added
2026-08-04) and refuse to start Cypress unless the server answering reports
`databaseEnv=test`. Before that, only the one-command path was guarded, so attaching to a
**dev** server left the seeded, destructive specs pointed at the development database.
The preflight derives its URL from `PORT` exactly as Cypress derives `baseUrl`, so it
follows a stale exported `PORT` to the same wrong server — which is the case worth
catching.

### Selectors

- Prefer role-based queries via `@testing-library/cypress`.
- Fall back to `data-testid` when roles don't apply; avoid brittle CSS-class selectors.

### Accessibility

`cypress-axe` / `axe-core` are available. In a spec:

```ts
cy.visit("/some-page")
cy.injectAxe()
cy.checkA11y()
```

## CI

All four CI jobs run in parallel on every push to `main` — see
[branching-and-releases.md](branching-and-releases.md). Three of them run tests:

- **`check` job:** `pnpm test:coverage` — the DB-free unit lane, which also enforces
  the coverage floors in `vitest.config.ts`.
- **`integration` job:** `pnpm test:integration` against an ephemeral
  `postgres:17-alpine` service container, migrated but **not seeded** (these tests
  create and delete their own rows). Added 2026-08-04; before that the lane ran on
  developer machines only.
- **`e2e` job:** `pnpm cy:e2e` — boots the server itself against its own service
  container.

Cypress records no video by default (`video: false` in `cypress.config.ts`).

`pnpm check:fast`, the local pre-push gate, covers **none** of the database lanes, so
CI is the only automatic gate for integration and e2e.

## Troubleshooting

- **`pnpm test:integration` can't connect / hangs** — the integration tests need
  `test_db`. Confirm Postgres is up, `pnpm db:push:test` has run, and
  `.env.test.local`'s `DATABASE_URL` is reachable. (The plain `pnpm test` unit lane
  is database-free, so it should never need a connection.)
- **Cypress can't reach the app** — confirm the server is running and that `PORT`
  and `CYPRESS_BASE_URL` in `.env.test.local` agree (the auto-server path derives
  its wait-URL from `PORT`).
- **Odd `cypress.config.js` behavior** — the `cy:*` scripts run `cy:clean` first;
  `pnpm cy:clean` removes the generated file if it gets stale.
