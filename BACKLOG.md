# Backlog — nextjs-dashboard

The canonical, cross-session next-steps list for this project. Kept in git so it's
visible in the editor and travels into every worktree. Claude reads and updates this
at the start/end of sessions. (Claude Code has no native cross-session backlog panel —
this file is the deliberate workaround.)

## Open

- [ ] **Weekly codemod routine** — scheduled Claude agent that checks Next.js/Biome
  releases, runs the codemods, verifies with `pnpm check:fast`, and opens a PR.
- [ ] **Renovate adoption** — for pnpm-version / node-version / `pnpm-workspace.yaml`
  override automation + grouped dep updates (Dependabot can't do those). Replaces
  Dependabot; needs the Mend Renovate GitHub App installed.
- [ ] **docs/ consolidation** — reconcile `docs/standards/` overlap with the existing
  `project-structure.md`, `when-to-use-app-error.md`, and `ui-refactor-strategy.md`.
- [ ] **Live deploy** — Vercel + Neon account setup: create projects, set env vars,
  run prod migrate + seed, paste the live URL into the README.
- [ ] **Vitest Phase 3** — remaining breadth (`server`, invoices/customers domain) and
  consider coverage thresholds once breadth lands. Forms breadth DONE (2026-06-11):
  68 characterization tests across all 11 testable forms files, pinning the three
  known quirks (key coupling, sensitive echo, payload-mapper overlap) ahead of the
  boundary redesign. _Lock behavior first, refactor behind the tests._
- [ ] **Forms/error boundary cleanup** — friction points surfaced while fixing Server
  Action serialization (PR #41, 2026-06-11). Small independent PRs, in roughly this
  order; full context in memory (`project_forms_error_refactor`):
  - [ ] **Tri-state form state** — `useActionState` initial value is a fake validation
    `AppError` (`cause: "INITIAL_STATE"`, empty message) because `FormResult` has no
    idle member. Model `idle | ok | err`, delete the hack in
    `src/shared/forms/logic/factories/form-state.factory.ts`, simplify form branching.
  - [ ] **Stop echoing sensitive fields** — failed submits echo submitted values
    (including login/signup passwords) back to the client in `metadata.formData`
    (`validateForm`, auth mappers). Same-user only, but allowlist what gets echoed.
  - [ ] **Decide FormResult vs Result** — `Result`'s `TError extends AppError`
    constraint forced `FormResult` to fork into its own union (PR #41). Either loosen
    the generic or formally document FormResult as a boundary DTO type.
  - [ ] **One validation funnel** — auth/users use `validateForm`; create-invoice does
    inline `safeParse`; update-invoice hand-flattens Zod errors. Unify on `validateForm`.
  - [ ] **Fix field-error key coupling** — `makeFormError` stamps form metadata onto any
    error key, but extractors only honor `validation` | `conflict`; a `database`-keyed
    form error silently drops its field errors (`form-error.inspector.ts`).
  - [ ] **Form error payload overlap** — consolidate `toFormErrorPayload` vs
    `formErrorPayloadMapper` (TODO in `form-error-payload.mapper.ts`). Production
    only uses `toFormErrorPayload`; the mapper variant is imported solely by auth
    integration tests and differs in fallback semantics (`[error.message]`).
- [ ] **Env hygiene** — surfaced during deploy prep (2026-06-11):
  - [ ] Remove dead `LOG_LEVEL` plumbing — only the unused `_getLogLevel` in
    `env-shared.ts` reads it; the real runtime level comes from
    `NEXT_PUBLIC_LOG_LEVEL` (with an `info` fallback in `logging.levels.ts`).
    Drop the tuple entry and the template line together.
  - [ ] Drop the per-lookup `console.log` in `env-access.utils.ts`
    (`Retrieving env var: …`) — it spams production function logs on every request.
  - [ ] Decide `SESSION_ISSUER`/`SESSION_AUDIENCE` shape — single-literal zod enums
    make them constants-as-env-vars. Either widen to `z.string().min(1)` so the env
    actually configures them (renaming later invalidates live sessions), or hardcode
    them as code constants and drop the env vars.
  - [ ] Remove `AUTH_SECRET`/`AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` from
    `.env.example.local` and any real env files — auth.js holdovers, zero references
    in code since the custom jose/bcrypt auth replaced it.
- [ ] **Per-env migration drift guard** — prod's migration set was missing the
  `revenues` DROP (dev/test had their 0006; prod stopped at 0005), so the first truly
  fresh production DB (Neon, 2026-06-11) was created with an obsolete FK and
  `db:seed:prod` failed with 23503. Three independent migration folders make this
  drift invisible. Either collapse to a single migration set, or add a CI check that
  the three `meta/_journal.json`/latest snapshots describe the same final schema.
- [ ] **knip full-report triage** — the earlier "knip residue" list came from a
  truncated report tail; the full report still shows (all pre-existing): 10 unused
  files (incl. `crypto.service.ts`, auth `mapper-chains`/`mapper-registry`, and 6
  devtools task scripts that may be knip-config gaps rather than dead code), 2
  unused deps + 3 devDeps (`tailwindcss`/`dotenv` likely false positives via
  configs), and 26 unused exports/types — several look like the same
  exported-but-internal pattern (`APP_ERROR_REGISTRY`, `AppErrorCoreDescriptor`).
  Triage each: knip config fix vs. un-export vs. delete.
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
  `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **TSConfig Version 6** - figure out how to use TSConfig Version 6.
- [ ]  The allowCypressEnv configuration option is enabled. This allows any browser code to read values from
  Cypress.env(). This is insecure and will be removed in a future major version.

## Done

<!-- Move finished items here with a date, or delete them. -->

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
  *"Failed to serialize an action for progressive enhancement"* warning is gone.
