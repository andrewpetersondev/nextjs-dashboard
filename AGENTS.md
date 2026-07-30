# AI assistant project rules

These instructions apply to AI Assistant, Claude, and ChatGPT when working in this repository.

## Project basics

- Use `pnpm`; do not switch package managers or regenerate the lockfile with another tool.
- This is a Next.js 16 / React 19 / TypeScript app that uses Biome, Vitest, Cypress, Drizzle, and Knip.
- Follow the existing code style and file organization before introducing new patterns.
- Prefer minimal, focused changes and preserve user-authored work.
- If rules conflict with each other or with common practice, stop and ask for clarification.

## Branching

Work flows through a **single-branch, local-first** model: cut a worktree branch from `main`, and merge
it back into `main` **locally** (in the primary checkout) when it is green, then push. There are no PRs
and no `develop` integration branch; CI runs on the push to `main`. Never commit directly on `main` —
always work from a worktree feature branch. See [`docs/branching-and-releases.md`](docs/branching-and-releases.md).

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is
outdated — the docs are the source of truth.

## Detailed project standards

For detailed architecture, naming, error-handling, and UI rules, also consult the Markdown files in
`docs/standards/` when they are relevant to the files you are changing. Apply each by judgment, based on
the files you are touching.

## Useful commands

- Fast validation: `pnpm check:fast`
- Full validation: `pnpm check`
- Repo validation: `pnpm check:repo`
- Format check: `pnpm biome:format:check`
- Lint/typegen/typecheck: `pnpm biome:lint`, `pnpm next:typegen`, `pnpm typecheck`
- Markdown lint + format (markdownlint-cli2 + dprint): `pnpm md:check` (verify), `pnpm md:fix` (autofix)
- Unit tests (no DB; runs anywhere): `pnpm test` (alias for `pnpm test:unit`)
- Integration tests (needs the test database): `pnpm test:integration`
- All Vitest tests (unit + integration): `pnpm test:all`
- Coverage (unit lane): `pnpm test:coverage`
- E2E tests: `pnpm cy:e2e`

## Markdown tooling

Markdown is linted by markdownlint-cli2 (`.markdownlint-cli2.jsonc`) and formatted by dprint (`dprint.json`) —
Biome's markdown support is still experimental, so it only owns JS/TS/JSON here. Formatting rules (whitespace,
list/table layout, emphasis markers) are disabled in markdownlint and owned by dprint. Use `pnpm md:check` to
verify and `pnpm md:fix` to auto-fix (markdownlint first, dprint last).

## Shell environment

Development happens on macOS with `zsh`. Some GNU/Linux idioms are missing or behave differently — don't assume them:

- `timeout` is not installed. Don't wrap commands in it; to wait on CI, poll `gh run watch` / `gh pr checks` directly.
- bash-only builtins (e.g. `mapfile`) aren't in `zsh`. Avoid them in one-off commands, or they fail silently.
- Don't pipe a command you care about through `tail`/`head` — the pipe reports the _last_ command's exit code and hides
  an upstream failure (a green-looking `head` over a failing test run). Check the raw exit code, or write to a file and read it.
- Prefer targeted single commands over long compound pipelines. Several destructive/compound forms are blocked by
  `.claude/settings.json` and will simply fail, so build them up granularly and confirm before anything destructive.

## Safety and context

- Do not read, print, or commit local environment files such as `.env*.local`.
- Avoid sending generated artifacts, dependency folders, build output, logs, coverage, or database dumps to AI tools.
- Treat `database/`, `drizzle/`, and `devtools/` as project code, not disposable generated output.
- These rules are enforced in two places: `.claude/settings.json` (Claude Code permission + sandbox rules — the enforcement layer for Claude) and `.aiignore` (JetBrains AI Assistant / Junie indexing). Keep the env/secret entries of the two in sync when adding new secret paths. Claude Code reads neither ignore file — `.claudeignore` is not a supported mechanism and has been removed.
