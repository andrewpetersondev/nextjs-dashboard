# Backlog — nextjs-dashboard

The canonical, cross-session next-steps list for this project. Kept in git so it's
visible in the editor and travels into every worktree. Claude reads and updates this
at the start/end of sessions. (Claude Code has no native cross-session backlog panel —
this file is the deliberate workaround.)

## Open

- [ ] **Phase 4 CI: e2e + branch protection** — the Cypress e2e suite is now wired into
      `ci.yml` as a parallel `e2e` job (`postgres:17-alpine` service container,
      `.env.test.local` regenerated on the runner from non-secret values + a per-run
      `openssl` `SESSION_SECRET`, then `db:migrate:test` → `db:seed:test` → `cy:e2e`) —
      **PR open** from `claude/vibrant-darwin-fe91f7`. Remaining after merge: enable branch
      protection on `main` requiring the `check` + `e2e` status checks (repo-admin setting).
      Closes the last item of the deploy plan (`project_dashboard_plan` in memory). Possible
      follow-up: bring the integration vitest lane into CI via the same service-container
      pattern.
- [ ] **Dependency-audit watch (from weekly-maintenance 2026-06-15)** — `pnpm audit`
      reports 3 advisories, all in **transitive dev/test tooling** (none in runtime
      deps, nothing shipped to prod): `form-data` **HIGH**
      ([GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx),
      patched `>=4.0.6`) reachable via `cypress` and `start-server-and-test>wait-on>axios`;
      `js-yaml` moderate ([GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68),
      `>=4.1.2`) and `markdown-it` moderate
      ([GHSA-6v5v-wf23-fmfq](https://github.com/advisories/GHSA-6v5v-wf23-fmfq), `>=14.1.2`),
      both via `markdownlint-cli2`. All three clear once those tools bump their own
      transitives; decide whether to wait for upstream or add `pnpm.overrides` pins
      (overrides go in `pnpm-workspace.yaml`, keep lockstep with package.json). Also
      pending: **biome 2.5.0** (current 2.4.16) was deferred by the weekly routine on
      2026-06-15 — it published 2026-06-12, right at the 3-day freshness threshold; due
      to be picked up (with `biome migrate --write`) on the next maintenance run.
- [ ] **Renovate adoption** — for pnpm-version / node-version / `pnpm-workspace.yaml`
      override automation + grouped dep updates (Dependabot can't do those). Replaces
      Dependabot; needs the Mend Renovate GitHub App installed. _(Partially covered as of
      2026-06-13 by the `weekly-maintenance` routine, which reports/bumps the
      pnpm/node/override gap; Renovate would still automate grouped updates.)_
- [ ] **docs/ consolidation** — reconcile `docs/standards/` overlap with the existing
      `project-structure.md`, `when-to-use-app-error.md`, and `ui-refactor-strategy.md`.
- [ ] **Forms taxonomy flattening** — the last open piece of the forms/error cleanup
      (the rest of the shrink → lock → decide → reshape roadmap completed 2026-06-13; see
      Done). Unscheduled. Core layering is sound, so don't migrate internals to DTOs.
      Full context in memory (`project_forms_error_refactor`).
- [ ] **Font experiment — finish or drop** — `doto` + `merienda` in `src/ui/styles/fonts.ts`
      are loaded via `next/font/google` and a `--font-experiment` CSS variable is defined,
      but the fonts are never applied to any element (the class silently falls back to
      sans-serif). Decide: wire them in (apply `doto.variable`/`merienda.variable`) or delete
      the exports + the CSS var. Left deliberately as tracked scaffolding (the only
      intended-but-unbuilt code surfaced by the 2026-06-14 dead-code triage); both stay
      visible in `pnpm knip` until decided.
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
      `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **TSConfig Version 6** - figure out how to use TSConfig Version 6.

## Done

<!-- Move finished items here with a date, or delete them. -->

- [x] **knip full-report triage** _(2026-06-14)_ — completed via a 44-candidate
      multi-agent triage (each candidate: git archaeology + full-repo reference search +
      intent search, with every delete verdict adversarially re-verified). Findings split
      into truly-dead / intended-future / false-positive / intentional-keep, and the result
      was applied: **knip dropped from 44 findings to 5**, all of which are deliberate keeps.
      - **Deleted (truly dead — all removed-feature residue):** 10 files —
      `src/server/crypto/crypto.service.ts`, `src/shared/primitives/session/session-id.brand.ts`,
      the auth docs pair `mapper-chains.ts`/`mapper-registry.ts` (+ their 4 README links),
      and the orphaned `devtools/users/` cluster (`user-input.mapper.ts` + 5 `*.task.ts`,
      duplicates of the live `cypress/node/tasks/*` after the `09241d39` consolidation; kept
      `devtools/users/hash-password.ts`). Plus dead symbols `convertCentsToDollars`,
      `ISO_YEAR_MONTH_REGEX`, `periodDates`, `DEFAULT_USER_ROLE` (policies-file dup),
      `toCustomerId` (cypress copy), `toUserId` (devtools copy), the two `tooling-env`
      exports `DATABASE_ENV`/`SESSION_SECRET` (kept the `safeParse` fail-fast guard), and
      the 2 npm deps `@next/env` + `drizzle-zod`. Two cascade orphans my edits exposed were
      also removed: `src/shared/primitives/money/types.ts` (`Cents`/`Dollars`) and
      `toPeriodDate`.
      - **Un-exported (used only in-file; surface reduced, behaviour unchanged):** the 3
      session brand symbols, `APP_ERROR_REGISTRY`, `AppErrorCoreDescriptor`,
      `CreateInvoiceInput`/`UpdateInvoiceInput`, `PeriodFirstDayString`, `EditUserFormInput`,
      the 3 `UpdateSession*NotRotatedDto` union members, and the 5 `_`-prefixed drizzle row
      types (Biome ignores the `_` prefix when unused).
      - **knip config:** `ignoreDependencies: ["tailwindcss", "@testing-library/dom"]` (PostCSS
      + peer-dep false positives knip can't trace).
      - **Left deliberately flagged (the residual 5):** `statusEnum` (drizzle `pgEnum` —
      un-export risks migration detection), `TableFooter`/`TableCaption` (UI-kit symmetry;
      un-export would trip Biome `noUnusedVariables`), and `doto`/`merienda` (tracked in the
      new **Font experiment** Open item). Verified: `check:fast` green, 286 unit tests pass,
      migration-drift still OK (dev/test/prod identical schema).

- [x] **Vitest Phase 3** _(2026-06-14)_ — breadth + coverage thresholds, all merged.
      Characterization tests ("lock behavior first") landed across the suite: forms
      (68 tests, 2026-06-11, PR #48), invoices/customers domain (45 tests, PR #70),
      and the `src/server` ports (19 tests, PR #71) — unit lane grew to **286 tests**.
      Along the way: pinned the unit lane to `TZ=UTC` so the invoice date helpers
      (which mix UTC and local-time ops) are deterministic across machines; and
      deliberately left `crypto.service.ts` untested because it's genuinely unused
      (folded into the knip item). Closed out with **coverage thresholds**: captured
      the 2026-06-14 baseline (stmts 22.53 / branch 20.25 / funcs 20.41 / lines
      22.44 — low because coverage `include`s the whole untested breadth) and set
      regression floors a couple points below it in `vitest.config.ts`
      (`thresholds: stmts 20 / branch 18 / funcs 18 / lines 20`), to ratchet up over
      time. Made them enforceable by adding a CI step that runs the **DB-free unit
      lane with coverage** (`pnpm test:coverage`) — also resolving the long-standing
      "the unit lane could be a fast CI step" opportunity (CI previously ran
      `check:fast` only). Verified both ways: passes at the floor; fails when a
      threshold is raised above current. _Remaining test work, tracked separately:
      integration-lane deep-DRY (see memory `project_vitest_improvement`)._

- [x] **Per-env migration drift guard** _(2026-06-14)_ — added the enforcement half
      the `weekly-maintenance` routine's drift _report_ was missing. A new env-free CLI,
      `devtools/cli/migration-drift.cli.ts` (script `pnpm db:drift`), reads the LATEST
      snapshot of each migration set (`drizzle/migrations/{dev,test,prod}/meta`, keyed by
      the highest `_journal.json` idx), canonicalizes it (recursively key-sorted; strips
      per-migration bookkeeping `id`/`prevId`/`_meta`), and asserts all three describe the
      **same final schema**. On mismatch it exits non-zero and prints the diverging env +
      the exact differing JSON paths (e.g. `tables.public.invoices.columns.amount.type`);
      it currently passes since prod was backfilled to `0006`. It's a pure file comparison
      (no DB, no env vars), so it's wired into `check:fast` **and** as its own CI step in
      `ci.yml` — the gate the backlog asked for (chose the lighter "assert same end state"
      option over collapsing to a single migration set). Migration _count_ differences are
      reported as a non-fatal note, not failed — only the final schema is gated. Verified
      both ways: green on the aligned tree; fails with the right paths when a prod snapshot
      column is mutated (then restored). `check:fast` green; knip recognizes the new CLI as
      an entry (no new finding).

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
