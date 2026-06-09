# Claude project instructions

Follow the shared repository instructions in `AGENTS.md`.
Also consult relevant detailed project standards in `docs/standards/`.

## Claude-specific context

### Slash commands

Project-level slash commands are defined in `.claude/commands/`:

| Command | Runs |
|---|---|
| `/check` | `pnpm check:fast` — lint + typecheck + typegen (report-only) |
| `/check-full` | `pnpm check` — full suite including unit tests and e2e (report-only) |
| `/lint` | `pnpm biome:lint && pnpm biome:format:check` (report-only) |
| `/fix` | `pnpm biome:lint:fix` then `pnpm biome:lint` — auto-fix lint/format, report residue |
| `/test` | `pnpm test` — unit tests only (report-only) |
| `/coverage` | `pnpm test:coverage` — vitest unit coverage summary (report-only) |
| `/e2e` | `pnpm cy:e2e` — Cypress e2e suite; needs `.env.test.local` (report-only) |

Report-only commands carry `disallowed-tools: Edit, Write, NotebookEdit`, so they structurally cannot modify files. `/fix` delegates writes to Biome (it does not hand-edit).

### Worktrees

Claude Code may check out work in a git worktree under `.claude/worktrees/`. Changes committed there go to a separate branch and do not affect `main` until a PR is merged.

### Memory

Project-level memory is stored in `~/.claude/projects/.../memory/`. It persists context across conversations (user preferences, feedback, project state). Check it when resuming prior work.

### Project standards (`docs/standards/`)

Detailed architecture, error-handling, naming, and UI standards live in `docs/standards/`. Apply the relevant ones by judgment, based on the files you are editing.
