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
  consider coverage thresholds once breadth lands. _Do this before the forms/error
  boundary cleanup below — lock behavior first, refactor behind the tests._
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
  - [ ] **Dead-seam sweep** — `AppError.fromDto` (test-only), `_isFormErr`/`_isFormOk`/
    `_isOk`/`_isErr` guards, parked result combinators decision, `retryable` removal
    TODO, and the overlap TODO in `form-error-payload.mapper.ts`.
- [ ] **Skills exploration** — evaluate reputable-source skills (e.g. Vercel's
  `vercel-react-best-practices`) against `docs/standards/` before adopting.
- [ ] **TSConfig Version 6** - figure out how to use TSConfig Version 6.
- [ ]  The allowCypressEnv configuration option is enabled. This allows any browser code to read values from
  Cypress.env(). This is insecure and will be removed in a future major version.

## Done

<!-- Move finished items here with a date, or delete them. -->

- [x] **Server Action serialization** _(2026-06-11)_ — `FormResult` now carries a plain
  `AppErrorJsonDto` instead of an `AppError` instance across the `useActionState`
  boundary, so Next.js can serialize form state for progressive enhancement. The
  *"Failed to serialize an action for progressive enhancement"* warning is gone.
