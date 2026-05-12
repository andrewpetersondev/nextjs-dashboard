# Claude project instructions

Follow the shared repository instructions in `AGENTS.md`.
Also consult relevant detailed project standards in `.aiassistant/rules/`.

## Claude-specific context

### Slash commands

Project-level slash commands are defined in `.claude/commands/`:

| Command | Runs |
|---|---|
| `/check` | `pnpm check:fast` — lint + typecheck + typegen |
| `/check-full` | `pnpm check` — full suite including tests and e2e |
| `/lint` | `pnpm biome:lint && pnpm biome:format:check` |
| `/test` | `pnpm test` — unit tests only |

### Worktrees

Claude Code may check out work in a git worktree under `.claude/worktrees/`. Changes committed there go to a separate branch and do not affect `main` until a PR is merged.

### Memory

Project-level memory is stored in `~/.claude/projects/.../memory/`. It persists context across conversations (user preferences, feedback, project state). Check it when resuming prior work.

### `.aiassistant/rules/` frontmatter

The rule files in `.aiassistant/rules/` include `apply: by file patterns` frontmatter. This is a JetBrains AI Assistant feature for scoped application. Claude does not enforce it automatically — use your judgment to apply the relevant rules based on the files you are editing.
