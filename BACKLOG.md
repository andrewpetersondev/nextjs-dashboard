# Backlog — nextjs-dashboard

The canonical, cross-session next-steps list for this project. Kept in git so it's
visible in the editor and travels into every worktree. Claude reads and updates this
at the start/end of sessions. (Claude Code has no native cross-session backlog panel —
this file is the deliberate workaround.)

## Open

- [ ] **Renovate adoption** — for pnpm-version / node-version / `pnpm-workspace.yaml`
      override automation + grouped dep updates (Dependabot can't do those). Replaces
      Dependabot; needs the Mend Renovate GitHub App installed. _(Partially covered as of
      2026-06-13 by the `weekly-maintenance` routine, which reports/bumps the
      pnpm/node/override gap; Renovate would still automate grouped updates.)_
- [ ] **docs/ consolidation** — reconcile `docs/standards/` overlap with the existing
      `project-structure.md`, `when-to-use-app-error.md`, and `ui-refactor-strategy.md`.
- [ ] **Vitest Phase 3** — remaining breadth (`server`, invoices/customers domain) and
      consider coverage thresholds once breadth lands. Forms breadth DONE (2026-06-11):
      68 characterization tests across all 11 testable forms files, pinning the three
      known quirks (key coupling, sensitive echo, payload-mapper overlap) ahead of the
      boundary redesign. _Lock behavior first, refactor behind the tests._
- [ ] **Forms taxonomy flattening** — the last open piece of the forms/error cleanup
      (the rest of the shrink → lock → decide → reshape roadmap completed 2026-06-13; see
      Done). Unscheduled. Core layering is sound, so don't migrate internals to DTOs.
      Full context in memory (`project_forms_error_refactor`).
- [ ] **Per-env migration drift guard** — _symptom resolved (2026-06-13): prod's missing
      `revenues` DROP was backfilled — prod now has `0006`, matching dev/test — and the
      `weekly-maintenance` routine now reports journal drift weekly. Remaining work = the
      systemic guard._ Three independent migration folders (`drizzle/migrations/{dev,test,prod}`)
      still let schemas drift silently: the 2026-06-11 miss created a fresh Neon prod DB with an
      obsolete FK and failed `db:seed:prod` with 23503. Either collapse to a single migration
      set, or add a CI **gate** that the three `meta/_journal.json`/latest snapshots describe the
      same final schema (the weekly report is detection, not enforcement).
- [ ] **knip full-report triage** — the earlier "knip residue" list came from a
      truncated report tail; the full report still shows (all pre-existing): 10 unused
      files (incl. `crypto.service.ts`, auth `mapper-chains`/`mapper-registry`, and 6
      devtools task scripts that may be knip-config gaps rather than dead code), 2
      unused deps + 3 devDeps (`tailwindcss`/`dotenv` likely false positives via
      configs), and 26 unused exports/types — several look like the same
      exported-but-internal pattern (`APP_ERROR_REGISTRY`, `AppErrorCoreDescriptor`).
      Triage each: knip config fix vs. un-export vs. delete.
      _Progress 2026-06-13:_ fixed the **config** first — `knip.json` now covers `test-support/`
      and `database/` (both were part of the TS project but invisible to knip), the test
      `entry` glob includes `src/shared/**/__tests__`, and `database/schema/relations.ts` is
      an entry (drizzle reads the schema dir by path, no TS importer); `docs/knip.md` rewritten
      (runs env-free via `pnpm knip`). That surfaced + pruned a dead cluster: revenues
      leftovers (`REVENUE_SOURCES`, `RevenueSource`, `RevenueId`) + an over-exported test mock
      (`createNextRedirectError`). Left deliberately: `statusEnum` (drizzle `pgEnum` — un-export
      risks migration detection) and the `_`-prefixed `$inferInsert` types (intentional-keep).
      Remaining: 10 unused files, 2 deps + 3 devDeps (dotenv/tailwindcss/@testing-library/dom
      are config/peer false positives), 18 exports + 13 types.
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
      `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **TSConfig Version 6** - figure out how to use TSConfig Version 6.

## Done

<!-- Move finished items here with a date, or delete them. -->

- [x] **e2e port-reuse guard** _(2026-06-13)_ — closed the trap that let `cy:e2e`
      silently run against the wrong server (the 2026-06-11 incident: 7 specs
      "failed" with `/api/db/reset` 404s because the suite hit a dev preview, not the
      test server). Re-auditing the script graph (verified against installed
      `dotenv-cli@11`/`start-server-and-test@3.0.9` source) showed it was **two
      distinct bugs**, fixed separately:
  - **Bug A — wrong port _number_.** The `env:test*` scripts load dotenv without
    `--override`, so an exported shell `PORT` silently shadows `.env.test.local`'s
    `PORT` (`dotenv` `populate()` keeps already-set keys). Fix: the harness now
    **owns the port** — `cypress-with-server.cli.ts` reads `PORT` straight from
    `.env.test.local` (via `dotenv.parse`), warns if an exported `PORT` differs, and
    **pins it** in the spawned child env so the server bind, the wait-on probe, and
    Cypress's `baseUrl` can't diverge. The shared `env:*` wrappers were left
    untouched (a blanket `-o` is a global precedence change — it's consumed by 37
    scripts incl. destructive `db:*:prod` and the CI entrypoints — so it was the
    wrong shape).
  - **Bug B — wrong server on the _right_ port.** Correcting the old wording:
    `start-server-and-test` has **no "reuse" feature** — it unconditionally starts
    its server; the real mechanism is that `wait-on` accepts any 2xx/304 with **no
    identity check** while `next dev` (no `-p`) steps aside when the port is busy, so
    a squatter answering the port is used. Fix: a new `cy:preflight` step
    (`devtools/cli/e2e-preflight.cli.ts`, wired into the harness's test command)
    asks `/api/health` which DB the live server is on and **aborts before any spec
    runs** unless `databaseEnv === "test"`. `/api/health` now returns a non-secret
    `{ databaseEnv, databaseName }` outside production (omitted on the public prod
    endpoint), reusing the same non-secret derivation as the `smoke/db-env-guard`
    spec — lifting that check from mid-suite to a fast pre-flight. _Verified live:
    health returns `databaseEnv` on a 200; preflight refuses a dev server
    (`databaseEnv=development`, exit 1) and errors cleanly on an unreachable port;
    `check:fast` green._ Follow-up (unscheduled): `smoke/db-env-guard` could
    consolidate onto the HTTP endpoint.

- [x] **Env hygiene** _(2026-06-13, PR #67)_ — finished the deploy-prep env cleanup
      (surfaced 2026-06-11). Four fixes: (1) deleted dead `LOG_LEVEL` plumbing
      (`getLogLevelResult`/`_getLogLevel` from `env-shared.ts`, the `env-access.utils.ts`
      accessor entry, the `config/README.md` bullet) — runtime level still comes from
      `NEXT_PUBLIC_LOG_LEVEL`; (2) dropped the per-lookup `console.log` in
      `env-access.utils.ts` (the error-path one stays); (3) **hardcoded
      `SESSION_ISSUER`/`SESSION_AUDIENCE` as code constants** in `session-jwt.constants.ts`
      and removed the env vars (schemas/exports/accessor entries across `env-schemas.ts`,
      `env-server.ts`, `env-access.utils.ts`) — they were single-literal zod enums
      (constants in disguise); values unchanged so behavior-preserving (JWTs still
      sign/verify with `"my-app"`/`"web"`); rationale: identity, not deployment config, and a
      single env string can't express multiple audiences; (4) confirmed the auth.js holdovers
      `AUTH_SECRET`/`AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` were already gone. Also fixed the
      stale `config/README.md` (server-env list + dead `env-next.ts` path) and the
      session-rotation test mock (corrected the no-op `@/server/config/env-server` path to the
      real module + dropped dead `SESSION_*` keys). The by-hand `.env*` line deletions
      (`LOG_LEVEL`/`SESSION_ISSUER`/`SESSION_AUDIENCE`) were done by Andrew. `check:fast` +
      unit (222) + session-rotation integration (4) green.

- [x] **Secrets no longer readable via `Cypress.env()`** _(2026-06-13, PR #66)_ —
      `cypress.config.ts` no longer writes `DATABASE_URL`/`SESSION_SECRET`/`DATABASE_ENV`
      into `config.env`, so browser-side spec code can't read them through `Cypress.env()`
      (and they can't leak into the command log/screenshots). The env-safety guard that the
      old `smoke/log-env` spec provided is preserved and strengthened: a new Node-side
      `db:env` task (`cypress/node/tasks/db-env.task.ts`) returns only a non-secret
      `{ databaseEnv, databaseName }` summary, and the renamed `smoke/db-env-guard` spec
      asserts `databaseEnv === "test"` + `databaseName === "test_db"` through it. Also removed
      the `cy.logEnv()` command (it dumped the entire `Cypress.env()`, secrets included) and
      stopped exporting `SESSION_SECRET` from `cypress-env.ts` (still validated, just not
      re-exported). `SESSION_SECRET` stays Node-side for the app server only. Finally set
      `allowCypressEnv: false` in `cypress.config.ts` — Cypress 15 leaves browser-side
      `Cypress.env()` enabled by default, so this hard-disables it (defense-in-depth even if a
      value is added to `config.env` later) and silences the deprecation warning.

- [x] **Forms/error boundary cleanup — roadmap complete** _(2026-06-13)_ — the full
      shrink → lock → decide → reshape roadmap is done. Shrink landed via the dead-seam
      sweep + knip residue entries below (#45–#47); then 68 characterization tests locked
      behavior (#48); ADR 001 chose `FormResult` as a boundary DTO with `null` idle (#49);
      the 7 `useActionState` forms moved to `null` initial state (#50); sensitive-field
      echo became allowlist-only so passwords never round-trip (#51); invoices were routed
      through one `validateForm` funnel (#52); field-error metadata is now detected by
      shape, not key (#63); and the two form-error payload mappers were consolidated onto a
      single `toFormErrorPayload` (#64). Core layering stayed sound — internals were not
      migrated to DTOs. Remaining work is tracked as the **Forms taxonomy flattening** Open
      item. Full context in memory (`project_forms_error_refactor`).

- [x] **Live deploy** _(2026-06-13)_ — the managed Vercel + Neon path is live. The
      production deployment is promoted and serving at
      <https://nextjs-dashboard-beige-pi-12.vercel.app/> (verified 200 OK — "Acme"
      landing page → `admin@admin.com` / `AdminPassword123!` demo login), and the URL is
      now in the README. Completes deploy Phase 3, building on the Docker standalone
      stack with `/api/health` + `docs/deployment.md` (#35), the Neon prod DB plus the
      backfilled `0006` seed fix (#44), and per-PR Vercel previews (#55). Cost: $0 on
      free tiers.

- [x] **Auth/invoices structure-assessment fixes** _(2026-06-13)_ — applied all 5 fixes
      from the 2026-06-12 module-structure assessment (verdict: **no restructure**; the
      auth/users split is sound). Three PRs, all merged:
  - **#57** — flattened 18 single-file leaf directories in `auth` (role suffixes already
    carried the categorization the folders duplicated).
  - **#58** — narrowed `toSessionPrincipal` to one input type (dropped a dead
    `UpdateSessionSuccessDto` branch); documented why `SessionPrincipalDto` is id+role
    only; removed auth's only application→infrastructure import (the demo-user helper's
    pg-error mapper call was a no-op — the repo already maps it — and the helper moved to
    `auth-user/commands`).
  - **#59** — routed the 4 invoices read actions (filtered/pages/latest/summary) through
    `InvoiceService` instead of importing DALs directly; dropped the non-serializable
    `db` param from the summary/latest actions.

  Full detail in memory (`project_structure_assessment`). Invoices module README updated
  to match (single service-routed path). _Not done: the broader `docs/ consolidation`
  item below (standards-overlap reconciliation) is separate and still open._

- [x] **Weekly codemod routine** _(2026-06-13)_ — created as a live `/schedule` cloud
      agent (`weekly-maintenance`, Mondays ~9am Central). Scope expanded past the original
      Next.js/Biome codemods to also cover dependency-pin blind spots (pnpm/Node/overrides),
      a migration-drift guard across the three drizzle migration sets, and a knip+`pnpm audit`
      report — all in one weekly PR; verifies with `check:fast`+unit, never runs e2e, never
      pushes to main. Full spec: `docs/weekly-maintenance-routine.md`.

- [x] **knip residue (named seven)** _(2026-06-11)_ — un-exported the five
      internally-used types (`DalIdentifiers`, `PgErrorMetadataBase`, `FormErrResult`,
      `ImmutableRecord`, `LogOperationMetadata`) and collapsed both duplicate-export
      pairs onto the names callers import (`DEFAULT_TIMEOUT`, `PG_CODE_TO_META`).
      knip's duplicate-exports section is gone; see the full-report triage item above
      for what remains.

- [x] **Dead-seam sweep** _(2026-06-11)_ — deleted the dormant result combinator
      modules (4 files, ~965 lines, never exported), orphaned `execute-dal-throw.ts` +
      `array.guards.ts`, the never-called `_is*` guards, test-only `AppError.fromDto`,
      and the write-only `retryable` field. Result module: 1,253 → ~240 lines.

- [x] **Server Action serialization** _(2026-06-11)_ — `FormResult` now carries a plain
      `AppErrorJsonDto` instead of an `AppError` instance across the `useActionState`
      boundary, so Next.js can serialize form state for progressive enhancement. The
      _"Failed to serialize an action for progressive enhancement"_ warning is gone.
