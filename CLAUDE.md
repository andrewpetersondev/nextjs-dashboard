# Claude project instructions

Follow the shared repository instructions in `AGENTS.md`.
Also consult relevant detailed project standards in `docs/standards/`.

## Claude-specific context

### Slash commands

Project-level slash commands are defined in `.claude/commands/`:

| Command       | Runs                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| `/check`      | `pnpm check:fast` — Biome + Markdown lint + typecheck + typegen (report-only)          |
| `/check-full` | `pnpm check` — full suite: Biome + Markdown, typecheck, unit tests, e2e (report-only)  |
| `/lint`       | `pnpm biome:lint + biome:format:check + md:lint + md:format:check` (report-only)       |
| `/fix`        | auto-fix Biome (`biome:lint:fix`) + Markdown (`md:fix`), then report residue           |
| `/test`       | `pnpm test` — unit tests only (report-only)                                            |
| `/coverage`   | `pnpm test:coverage` — vitest unit coverage summary (report-only)                      |
| `/e2e`        | `pnpm cy:e2e` — Cypress e2e suite; needs `.env.test.local` (report-only)               |
| `/ship`       | gate on `pnpm check:fast`, commit, push, open a PR, watch CI, reconcile BACKLOG/memory |

Report-only commands carry `disallowed-tools: Edit, Write, NotebookEdit`, so they structurally cannot modify files. `/fix` delegates writes to Biome, markdownlint-cli2, and dprint (it does not hand-edit). `/ship` is the one command that writes git history — it commits, pushes, and opens a PR, and only ever runs from a worktree branch, never `main`.

### Markdown tooling

Markdown is linted by **markdownlint-cli2** (`.markdownlint-cli2.jsonc`) and formatted by **dprint** (`dprint.json`) — Biome's markdown support is still experimental, so it only owns JS/TS/JSON here. The two tools have non-overlapping responsibilities: formatting rules (whitespace, list/table layout, emphasis markers) are disabled in markdownlint and owned by dprint. Use `pnpm md:check` to verify and `pnpm md:fix` to auto-fix (markdownlint first, dprint last).

### Worktrees

Claude Code may check out work in a git worktree under `.claude/worktrees/`. Changes committed there go to a separate branch and do not affect `main` until a PR is merged.

### Memory

Project-level memory is stored in `~/.claude/projects/.../memory/`. It persists context across conversations (user preferences, feedback, project state). Check it when resuming prior work.

### Project standards (`docs/standards/`)

Detailed architecture, error-handling, naming, and UI standards live in `docs/standards/`. Apply the relevant ones by judgment, based on the files you are editing.
