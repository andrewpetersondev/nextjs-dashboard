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
  consider coverage thresholds once breadth lands.
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
