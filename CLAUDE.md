# Claude project instructions

Follow the shared repository instructions in `AGENTS.md`.
Also consult relevant detailed project standards in `docs/standards/`.

## Workflow: landing changes

After completing any backlog item or fix: run `pnpm check:fast`, commit on the worktree feature branch, then merge it into `main` **locally** (in the primary checkout) and push — CI runs on that push. Reconcile BACKLOG.md and memory/docs as part of the same flow, before committing, so it all lands together.

## Git Safety

Never delete branches/worktrees or run destructive DB/git commands without explicit confirmation. Always work from a worktree feature branch cut from `main` — never commit directly on `main`. A feature branch reaches `main` through a **local** merge in the primary checkout (your review gate), then a push; CI runs on that push. `main` is protected against force-pushes and deletion (direct pushes are allowed, by design).

## Worktrees

This project runs in git worktrees under `.claude/worktrees/`, not a single checkout — work committed there lives on a separate branch (cut from `main`, the default) and does not touch `main` until you merge it in **locally**. Because all worktrees share one git object store, that merge needs no fetch or remote round-trip. Expect **multiple worktrees at once**: today usually one per Claude Code session, with the intended direction being branch-per-architecture lanes for running several sessions in parallel. Reason about branches, env files, and isolation with that in mind. The full branch/CI model is in [`docs/branching-and-releases.md`](docs/branching-and-releases.md). (Shell/OS specifics live in `AGENTS.md` → "Shell environment".)

## Claude-specific context

### Slash commands

Project-level slash commands are defined in `.claude/commands/`:

| Command       | Runs                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `/check`      | `pnpm check:fast` — Biome + Markdown lint + typecheck + typegen (report-only)                                |
| `/check-full` | `pnpm check` — full suite: Biome + Markdown, typecheck, typegen, unit + integration tests, e2e (report-only) |
| `/lint`       | `pnpm biome:lint + biome:format:check + md:lint + md:format:check` (report-only)                             |
| `/fix`        | auto-fix Biome (`biome:lint:fix`) + Markdown (`md:fix`), then report residue                                 |
| `/test`       | `pnpm test` — unit tests only (report-only)                                                                  |
| `/coverage`   | `pnpm test:coverage` — vitest unit coverage summary (report-only)                                            |
| `/e2e`        | `pnpm cy:e2e` — Cypress e2e suite; needs `.env.test.local` (report-only)                                     |
| `/ship`       | review, reconcile BACKLOG/docs, gate on `pnpm check:fast`, commit, then hand off the local merge into `main` |

Report-only commands carry `disallowed-tools: Edit, Write, NotebookEdit`, so they structurally cannot modify files. `/fix` delegates writes to Biome, markdownlint-cli2, and dprint (it does not hand-edit). `/ship` validates and commits on a worktree feature branch (never on `main`), then hands you the local merge into `main` — it does not push or open PRs. Merging into `main` (your review gate) and the push that triggers CI and the Vercel deploy stay yours.

### Markdown tooling

Markdown is linted by **markdownlint-cli2** (`.markdownlint-cli2.jsonc`) and formatted by **dprint** (`dprint.json`) — Biome's markdown support is still experimental, so it only owns JS/TS/JSON here. The two tools have non-overlapping responsibilities: formatting rules (whitespace, list/table layout, emphasis markers) are disabled in markdownlint and owned by dprint. Use `pnpm md:check` to verify and `pnpm md:fix` to auto-fix (markdownlint first, dprint last).

### Memory

Project-level memory is stored in `~/.claude/projects/.../memory/`. It persists context across conversations (user preferences, feedback, project state). Check it when resuming prior work.

### Project standards (`docs/standards/`)

Detailed architecture, error-handling, naming, and UI standards live in `docs/standards/`. Apply the relevant ones by judgment, based on the files you are editing.
