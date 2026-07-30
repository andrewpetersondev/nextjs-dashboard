# Backlog — nextjs-dashboard

The canonical, cross-session next-steps list for this project. Kept in git so it's
visible in the editor and travels into every worktree. Claude reads and updates this
at the start/end of sessions. (Claude Code has no native cross-session backlog panel —
this file is the deliberate workaround.)

## Open

> **Priority focus — set 2026-06-25 (active job hunt, ~1–2 week window).** Shifted the
> emphasis from infrastructure/tooling to the **demo surface a hiring manager actually
> experiences in 60 seconds**: kill demo dead-ends → first impression → one memorable
> feature. The infra-polish items still matter but drop to "Later" below. Full rationale
> in memory (`project_job_hunt_priority_shift`). If week 2 runs long, ship the week-1
> polish on its own — a clean demo beats a half-built feature.

### Now — job-hunt focus (demo-first, ~2 weeks)

1. **Kill the demo dead-ends** (fast, high honesty-per-hour)
   - [x] ~~`forgot-password` live stub~~ — done 2026-07-22, see Done below.
   - [ ] **Stub/empty module READMEs (~12)** — empty (0 bytes) or literal
         `# [Capability Name]` templates: auth `application/**` sub-layers,
         `src/shared/{http,primitives,routing,time}`, `forms/notes`. Fill the meaningful
         ones, delete the dead templates. (Surfaced by the 2026-06-25 docs-drift audit.)
   - [ ] **Font experiment — finish or drop** — wire `doto`/`merienda`
         (`src/ui/styles/fonts.ts`, `--font-experiment` CSS var) into the UI or delete the
         exports + the var. Tracked scaffolding from the 2026-06-14 dead-code triage; stays
         visible in `pnpm knip` until decided.
2. **First impression** — the live link is what recruiters click first.
   - [ ] Real landing page (`src/app/page.tsx`) explaining the project + a one-click
         "Try the demo" login.
   - [ ] Surface the `docs/diagrams/` architecture diagrams on the README (strong, and
         currently buried).
3. **One memorable feature — invoice status lifecycle** (the interview story).
   - [ ] Status enum + guarded transitions (pending → paid → overdue/void), status badges,
         a status filter on the invoices list, and tests. Domain-native (invoice
         schema/DAL/list already exist), bounded to ~a week, whiteboard-able end to end.
         No specific tech to show off (confirmed 2026-06-25) → build it the straightforward
         server-action way matching the existing architecture.
4. **(Optional, alongside) a11y + Lighthouse pass** — `cypress-axe` + `axe-core` are
   already installed; run a real sweep, fix findings, write up before/after.

### Later — lower priority during the job hunt (infra/tooling polish)

- [ ] **Renovate adoption** — for pnpm-version / node-version / `pnpm-workspace.yaml`
      override automation + grouped dep updates (Dependabot can't do those). Replaces
      Dependabot; needs the Mend Renovate GitHub App installed. _(Partially covered as of
      2026-06-13 by the `weekly-maintenance` routine, which reports/bumps the
      pnpm/node/override gap; Renovate would still automate grouped updates.)_
- [ ] **5 new `noUnnecessaryConditions` warnings** _(added 2026-07-27, weekly maintenance)_ — Biome
      2.5.5 widened the rule and now flags redundant defensive guards on non-nullable params:
      `invoice.service.ts:68`, `invoice.repository.ts:56`, and `if (!(db && id))` in the
      delete/read/update invoice DALs. Warnings only (`check:fast` stays green). Deciding whether to
      delete the guards is a real code change — they're runtime belt-and-braces against untyped
      callers — so it was deliberately left out of the maintenance bump.
- [ ] **docs/ consolidation** — reconcile `docs/standards/` overlap with the existing
      `project-structure.md`, `when-to-use-app-error.md`, and `ui-refactor-strategy.md`.
- [ ] **Forms taxonomy flattening** — the last open piece of the forms/error cleanup
      (the rest of the shrink → lock → decide → reshape roadmap completed 2026-06-13; see
      Done). Unscheduled. Core layering is sound, so don't migrate internals to DTOs.
      Full context in memory (`project_forms_error_refactor`).
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
      `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **Integration lane in CI (optional)** — the e2e job's Postgres-service-container
      pattern (2026-06-23) could also run the integration vitest lane in CI; today only
      the DB-free unit lane runs there. Unscheduled.
- [ ] **Issue tracking: GitHub Issues/Projects vs. BACKLOG.md** _(revisit Mon 2026-06-29)_ —
      consider a **hybrid**, not a switch: keep `BACKLOG.md` as the worktree-friendly planning
      doc the AI sessions drive, but file the _narratable_ units (e.g. the invoice-status
      feature, the forgot-password fix) as GitHub Issues that PRs close (`Closes #N`), plus a
      small Projects board. Rationale = portfolio signal: makes the repo _look_ as
      professionally run as it already is. Not now — only worth it once the demo polish lands.
      Curiosity-driven (2026-06-25 chat).

## Done

Terse log — newest first. Full detail lives in the `project_*` memory files.

- [x] **Production guard for destructive DB tasks** _(2026-07-30)_ — `db:reset:prod` /
      `db:seed:prod` (and any `:dev` → `:prod` typo) could wipe/seed the production DB with
      one command. Added `devtools/shared/db/prod-db.guard.ts`: reset/seed now refuse to run
      when `DATABASE_ENV` is `production` (missing/unrecognized fails closed) unless
      `CONFIRM_PROD_DB=yes` is set; blocked runs exit 1 via `runCli`. 17 unit tests (vitest
      unit lane now also picks up `devtools/**` tests); docs updated (drizzle, deployment,
      getting-started, scripts guide, README).
- [x] **TypeScript 7 upgrade** _(2026-07-28)_ — typescript `^6.0.3` → `^7.0.2` (native compiler)
      on next 16.2.12 (16.2.11 crashes outright on TS7). tsconfig: dropped `baseUrl` +
      `ignoreDeprecations` (removed in TS7). next.config: `experimental.useTypeScriptCli: true`
      (TS7 drops the old compiler API). Cypress needed real work: bumped to `^15.19.0`
      (adds TS7 spec preprocessing) but its bundled Babel fallback is packed broken, so
      the npm `@cypress/webpack-batteries-included-preprocessor@^4.2.0` is wired explicitly in
      `cypress.config.ts` with `@cypress/webpack-preprocessor@^7.1.1` (4.2.0's declared peer
      `^6.0.4` is stale — 6.x lacks `getResolvedTypescriptVersion`). `cypress/tsconfig.json`
      re-adds `baseUrl` locally (tsconfig-paths still needs it for aliases; that file is outside
      the `tsc -b` graph so TS7 never sees it). Also restored the `next` caret (`^16.2.12`,
      closing the 2026-07-27 backlog item) and closed the old "TSConfig modernization for TS 6.0"
      item (superseded). Verified: check:fast, unit 289/289, e2e 35/35, production build.
      This also lands the cypress part of Dependabot #113 early. Full recipe in memory
      (`project_ts7_and_release_age_gotchas`).

- [x] **Forgot-password request flow (ADR-006 in the product)** _(2026-07-22)_ — replaced the
      live stub at `/auth/forgot-password` with a real request-reset form: email-only schema,
      `requestPasswordResetAction` that after validation does **no user lookup and no branching
      on account existence** (response identical by construction — the ADR-006 story), generic
      "if an account exists…" confirmation plus an honest "Demo project: no reset email is
      actually sent." caption. Route added to `ROUTES.auth` + `PUBLIC_ROUTES` (authenticated
      users bounce to dashboard like login/signup). Deliberately out of scope: tokens, email
      delivery, set-new-password page. Tests: 3 unit (incl. the identical-response ADR-006
      lock) + 3 e2e (login-page link, confirmation swap, seeded-vs-unknown email parity).
- [x] **Dependency catch-up + audit overrides** _(2026-07-22)_ — landed the 4 stale PRs: #107
      weekly maintenance (next 16.2.10, biome 2.5.2) + #108 Actions bumps merged; #105 closed
      (superseded by #107); #109 superseded by a local commit applying its 13 clean bumps while
      **holding biome at 2.5.2** (2.5.3 panics on 8 form tsx files with exit 0 — silent lint
      loss; memory `project_biome_nested_config`). Added audit overrides for 4 new highs:
      brace-expansion ^5.0.7, js-yaml ^4.3.0, linkify-it ^5.0.2, sharp ^0.35.3 (next pins
      ^0.34.5 — override until next bumps; prod build + native load verified). `pnpm audit`
      clean, all Dependabot alerts closed.
- [x] **Single-branch, local-first model (retired `develop`)** _(2026-06-25)_ — collapsed the two-tier
      `develop → main` model back into a single `main` branch. `main` is the default again; feature work
      happens in worktree branches and is **merged into `main` locally** (worktrees share one object
      store — no remote round-trip, no PRs), then pushed. CI (`ci.yml`, `codeql.yml`) now triggers on
      push to `main` only; the slow E2E runs on every `main` push as a safety net (no pre-merge gate —
      `pnpm check:fast` is the local pre-push gate). Relaxed the `main` ruleset to allow direct pushes
      (kept no-force-push + no-delete), deleted the `develop` ruleset, retired the `develop` branch, and
      rewrote `/ship` (now hands off a local merge; `/promote` deleted). Docs reconciled
      (`branching-and-releases.md`, the flow diagram, `lane-map.md`, CLAUDE/AGENTS). Rationale: the
      remote-first PR flow created friction (stale local branches, GitHub as the orchestration point)
      that blocked real use during the job hunt. Detail: memory `project_branch_model_migration`.
- [x] **Docs-drift audit — remaining md files** _(2026-06-25)_ — drift-checked the ~53 prose
      markdown files yesterday's sweep didn't touch (ADRs excluded) via 7 read-only audit lanes;
      48 clean, **5 fixed**: `docs/knip.md` (`ignoreDependencies`), error-handling standard
      (`normalizeUnknownError`), `src/shared/README.md` (real dir list),
      `src/shared/core/config/README.md` (real env exports), `cypress/README.md` (now in CI / no
      skips). Surfaced a separate gap — ~12 empty/template module READMEs — now tracked under "Now".
- [x] **Docs-drift reconciliation sweep** _(2026-06-24, #97–#100 → develop, promoted #101)_ — the
      first real **parallel-lane run**: four worktrees, each scoped to non-overlapping docs —
      customers/banner (#97), invoices (#98), auth/users (#99), shared/cross-cutting (#100) — re-verified
      each module's README/standards against the current code and corrected the drift (24 files,
      +349/-249, docs-only). Promoted `develop → main` as a merge commit (#101): the first **clean**
      promote after the #96 divergence heal — both file diff and commit list showed only the four real
      docs commits. Validated the lane workflow end-to-end; the cross-module type-contract safeguards
      weren't exercised (docs touch no types). Detail: memory `project_docs_consolidation`,
      `project_branch_per_architecture_idea`.
- [x] **Two-tier branch model: `develop` → `main`** _(2026-06-23)_ — reworked the git strategy for
      parallel multi-session work: `develop` is now the **default** branch (integration), `main` is
      promote-only (production). GitHub rulesets gate `develop` (`Lint & type-check`) and `main`
      (`+ E2E (Cypress)`); `ci.yml` split so the slow E2E runs only for main-targeting PRs (#89);
      branch model + Mermaid diagram documented (#90); Vercel verified (main=production,
      develop=free staging URL); added the `/promote` command + updated CLAUDE.md/AGENTS.md
      git-safety wording; the lane map landed (`docs/lane-map.md` + diagram). ⚠️ Rulesets pin required-status-check
      contexts to the CI job **names** (`Lint & type-check`, `E2E (Cypress)`) — rename a job and
      merges silently block. Detail: memory `project_branch_model_migration`.
- [x] **Worktree/branch cleanup tooling** _(2026-06-23, #88)_ — added a `/clean-worktrees`
      command (`.claude/commands/clean-worktrees.md`): fetch → classify `[gone]`/merged/empty
      lanes (verified via `gh` PR state or `ahead=0`) → auto-remove only **clean** worktrees
      (never `--force`) → emit a paste-ready `git branch -d` block (branch deletion stays denied
      in `settings.json`, so the human runs it) → report. Skips the current session, `main`, and
      `archive/*`. Plus a read-only `SessionStart` hook (`.claude/hooks/stale-worktrees.sh`, wired
      in `settings.json`) that nudges when stale lanes exist and stays silent when clean. Also
      fixes the `/clean_gone` plugin command's latent bug: it greps `git branch -v`, which never
      shows `[gone]` (needs `-vv`).
- [x] **`/ship` command + insights-report tooling docs** _(2026-06-23, #86 + reorder follow-up)_ —
      added `.claude/commands/ship.md` (end-to-end PR loop: branch-safety → review → reconcile →
      `check:fast` gate → commit → push → PR → CI-watch; worktree-only), an AGENTS.md
      "Shell environment" section (macOS/zsh footguns: no `timeout`/`mapfile`, the `tail`/`head`
      exit-code mask), and CLAUDE.md workflow/git-safety/worktree context from the report blocks,
      deduped against AGENTS.md. Sourced from a `/insights` report; its
      first run (#86) exposed a step-order bug — reconcile ran after the commit — fixed in the
      follow-up so doc/backlog updates land in the same PR.
- [x] **Dependency-audit watch: 2 moderate alerts cleared** _(2026-06-23, #85)_ — the two
      transitive dev-tooling quadratic-DoS advisories pulled via `markdownlint-cli2@0.22.1`
      (latest, which pins both exactly so no upstream bump was possible) fixed with
      `pnpm-workspace.yaml` overrides: `js-yaml ^4.2.0`
      ([GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68)) +
      `markdown-it ^14.2.0`
      ([GHSA-6v5v-wf23-fmfq](https://github.com/advisories/GHSA-6v5v-wf23-fmfq)); `pnpm audit`
      → 0. Earlier: the `form-data` HIGH cleared upstream + biome 2.5.0 adopted. Ongoing audit
      watch continues via the `weekly-maintenance` routine.
- [x] **Phase 4 CI: e2e + branch protection** _(2026-06-23)_ — Cypress e2e wired into
      `ci.yml` as a parallel `e2e` job (Postgres service container, runner-generated
      `.env.test.local`, migrate→seed→`cy:e2e`; PR #80, green ~3m), and `main` branch
      protection fixed via `gh api` to require `check` + `E2E (Cypress)` with 0 approvals.
      Completes the deploy plan. ⚠️ If the ci.yml job names change, update the ruleset's
      required-status-check contexts or merges silently block. Detail: memory
      `project_dashboard_plan`.
- [x] **Biome deterministic lint + `noConsole`** _(2026-06-23, #78/#79)_ — consolidated the
      nested `biome.json` into root `overrides` (fixes the 2.5.0 non-deterministic
      nested-config scan), enabled `noConsole` routing app/DAL console through the structured
      logger (logger/CLI/config exempt), and cleared all remaining Biome warnings/info.
      Detail: memory `project_biome_nested_config`.
- [x] **knip full-report triage** _(2026-06-14)_ — 44 findings → 5 (all deliberate
      keeps) via adversarial multi-agent triage: deleted 10 dead files + dead symbols +
      2 unused deps, un-exported the rest. `check:fast` + 286 unit green.
- [x] **Vitest Phase 3** _(2026-06-14)_ — breadth characterization tests (forms #48,
      invoices/customers #70, server #71 → unit lane 286) + coverage floors in
      `vitest.config.ts` + DB-free unit lane wired into CI (#72); `TZ=UTC` pin. Detail:
      memory `project_vitest_improvement`.
- [x] **Per-env migration drift guard** _(2026-06-14)_ — `pnpm db:drift`
      (`devtools/cli/migration-drift.cli.ts`) asserts the dev/test/prod migration sets
      describe the same final schema; env-free, wired into `check:fast` + CI.
- [x] **e2e port-reuse guard** _(2026-06-13)_ — fixed the trap that let `cy:e2e` hit the
      wrong server: the harness now owns `PORT` from `.env.test.local`, and a
      `/api/health` preflight aborts unless `databaseEnv === "test"`. Detail: memory
      `project_cypress_improvement`.
- [x] **Env hygiene** _(2026-06-13, PR #67)_ — removed dead `LOG_LEVEL` plumbing,
      hardcoded `SESSION_ISSUER`/`SESSION_AUDIENCE` as constants (were single-literal
      enums), dropped a debug log. Behavior-preserving.
- [x] **Secrets out of `Cypress.env()`** _(2026-06-13, PR #66)_ — stopped writing
      `DATABASE_URL`/`SESSION_SECRET`/`DATABASE_ENV` into `config.env`; added a non-secret
      `db:env` task + `allowCypressEnv: false`. Detail: memory `project_cypress_improvement`.
- [x] **Forms/error roadmap complete** _(2026-06-13)_ — shrink→lock→decide→reshape done
      (#45–#52, #63, #64): 68 lock tests, ADR 001 null-idle, allowlist echo, shape-based
      field-error detection, single `toFormErrorPayload`. Core layering unchanged. Detail:
      memory `project_forms_error_refactor`.
- [x] **Live deploy** _(2026-06-13)_ — Vercel + Neon live at
      <https://nextjs-dashboard-beige-pi-12.vercel.app/> (URL in README), $0 on free
      tiers. Builds on the Docker standalone stack + `/api/health` (#35) and the Neon prod
      DB + `0006` seed backfill (#44).
- [x] **Auth/invoices structure fixes** _(2026-06-13)_ — all 5 fixes from the 2026-06-12
      assessment (verdict: no restructure): auth leaf-dir flatten (#57), `toSessionPrincipal`
      narrowing + drop auth's only app→infra import (#58), invoices reads routed through
      `InvoiceService` (#59). Detail: memory `project_structure_assessment`.
- [x] **Weekly maintenance routine** _(2026-06-13)_ — live `/schedule` agent
      (`weekly-maintenance`, Mondays ~9am Central): codemods + dep-pin/drift/knip+audit in
      one weekly PR. Spec: `docs/weekly-maintenance-routine.md`.
- [x] **knip residue (named seven)** _(2026-06-11)_ — un-exported 5 internal types +
      collapsed 2 duplicate-export pairs (#46/#47).
- [x] **Dead-seam sweep** _(2026-06-11)_ — deleted dormant result combinators (4 files,
      ~965 lines) + orphaned guards/helpers (#45); result module 1,253 → ~240 lines.
- [x] **Server Action serialization** _(2026-06-11)_ — `FormResult` carries
      `AppErrorJsonDto` (not an `AppError` instance) across the `useActionState` boundary
      (#41), fixing the progressive-enhancement serialize warning.
