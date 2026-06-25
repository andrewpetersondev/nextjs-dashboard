# Testing

The dashboard has three test lanes. The **unit** lane is database-free and runs
anywhere; the **integration** and **E2E** lanes talk to the real `test_db` under
the **test environment** (`.env.test.local`):

| Lane        | Tool    | Command                 | What it covers                                                | Needs `test_db`? |
| ----------- | ------- | ----------------------- | ------------------------------------------------------------- | ---------------- |
| Unit        | Vitest  | `pnpm test`             | Pure logic, mappers, services — dependencies mocked           | No               |
| Integration | Vitest  | `pnpm test:integration` | Full-stack flows through the layers against the real database | Yes              |
| End-to-end  | Cypress | `pnpm cy:e2e`           | The running app in a real browser, including accessibility    | Yes              |

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
pnpm test:ui          # Vitest UI
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
- `globals: true` — `describe` / `it` / `expect` are available without importing.
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

Both CI jobs run on every push to `main` — see
[branching-and-releases.md](branching-and-releases.md).

- **`check` job (every push to `main`):** runs `pnpm test:coverage`,
  the DB-free unit lane, which also enforces the coverage floors in
  `vitest.config.ts`. The integration lane is **not** run in CI — it needs a live
  database — so run it locally before you merge into `main`.
- **`e2e` job (every push to `main`):** `pnpm cy:e2e` (alias `pnpm cy:e2e:ci`) —
  it boots the server itself against an ephemeral Postgres service container.
- Cypress records no video by default (`video: false` in `cypress.config.ts`).

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
