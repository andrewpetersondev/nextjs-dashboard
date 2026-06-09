# AI assistant project rules

These instructions apply to AI Assistant, Claude, and ChatGPT when working in this repository.

## Project basics

- Use `pnpm`; do not switch package managers or regenerate the lockfile with another tool.
- This is a Next.js 16 / React 19 / TypeScript app that uses Biome, Vitest, Cypress, Drizzle, and Knip.
- Follow the existing code style and file organization before introducing new patterns.
- Prefer minimal, focused changes and preserve user-authored work.
- If rules conflict with each other or with common practice, stop and ask for clarification.

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
- Lint/typecheck/typegen: `pnpm biome:lint`, `pnpm typecheck`, `pnpm next:typegen`
- Unit tests (no DB; runs anywhere): `pnpm test` (alias for `pnpm test:unit`)
- Integration tests (needs the test database): `pnpm test:integration`
- All Vitest tests (unit + integration): `pnpm test:all`
- Coverage (unit lane): `pnpm test:coverage`
- E2E tests: `pnpm cy:e2e`

## Safety and context

- Do not read, print, or commit local environment files such as `.env*.local`.
- Avoid sending generated artifacts, dependency folders, build output, logs, coverage, or database dumps to AI tools.
- Treat `database/`, `drizzle/`, and `devtools/` as project code, not disposable generated output.
- These rules are enforced for AI tools by `.aiignore` / `.claudeignore` (what gets indexed) and `.claude/settings.json` (Claude Code tool permissions). Keep all three in sync when adding new secret or artifact paths.
