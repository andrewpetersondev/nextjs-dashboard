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
- [ ] **Env hygiene** — surfaced during deploy prep (2026-06-11):
  - [x] Remove dead `LOG_LEVEL` plumbing _(2026-06-13)_ — deleted `getLogLevelResult` +
        `_getLogLevel` from `env-shared.ts` (and their orphaned `LogLevel`/`LogLevelSchema`
        imports), dropped the `"LOG_LEVEL"` entry from the `env-access.utils.ts` accessor
        tuple, and removed the stale `LOG_LEVEL` bullet from `config/README.md`. Runtime level
        still comes from `NEXT_PUBLIC_LOG_LEVEL`; `check:fast` green. **Still TODO by hand:**
        delete `LOG_LEVEL=info` from `.env.example.local` — the deny rule blocks tooling from
        editing env files.
  - [x] Drop the per-lookup `console.log` in `env-access.utils.ts` _(2026-06-13)_ —
        removed the `Retrieving env var: …` line. (A second `console.log` on the missing/empty
        path remains, but it only fires on error, not on every lookup.)
  - [ ] Decide `SESSION_ISSUER`/`SESSION_AUDIENCE` shape — single-literal zod enums
        make them constants-as-env-vars. Either widen to `z.string().min(1)` so the env
        actually configures them (renaming later invalidates live sessions), or hardcode
        them as code constants and drop the env vars.
  - [x] Remove `AUTH_SECRET`/`AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` from
        `.env.example.local` and any real env files — auth.js holdovers, zero references
        in code since the custom jose/bcrypt auth replaced it. _(Verified done 2026-06-13:
        absent from `.env.example.local`, zero code references. Double-check your own
        real `.env*.local` files — tooling can't read those.)_
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
- [ ] **e2e port-reuse guard** — `cy:e2e` inherits the session's `PORT` (the
      `env:test*` scripts run dotenv without `-o`, so an exported `PORT` wins over
      `.env.test.local`), and start-server-and-test reuses ANY server already
      answering on that port. With a dev preview running on 3001, two full suite
      runs (2026-06-11) silently executed against the dev server — `/api/db/reset`
      404s there, so 7 specs "failed" with no hint of the real cause. Fix ideas:
      add `-o` to the `env:test*` scripts, pin the cypress PORT, or have
      `cypress-with-server.cli.ts` verify the responding server's `DATABASE_ENV`
      (the `smoke/log-env` spec already proves the concept).
- [ ] **TSConfig Version 6** - figure out how to use TSConfig Version 6.
- [ ] **Secrets readable via `Cypress.env()`** — `cypress.config.ts` writes `DATABASE_URL`
      and `SESSION_SECRET` into `config.env` (in `setupNodeEvents`), so any browser-side spec
      code can read them through `Cypress.env()`. (The original note blamed the `allowCypressEnv`
      option, but that flag isn't actually set — the exposure is the explicit `config.env.*`
      assignments.) Pass only what specs truly need to the browser; keep DB/secret values
      Node-side in tasks, or scope them out of `config.env`.

## Done

<!-- Move finished items here with a date, or delete them. -->

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
