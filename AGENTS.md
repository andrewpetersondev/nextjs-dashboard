# AI assistant project rules

These instructions apply to AI Assistant, Junie, Claude, and ChatGPT when working in this repository.

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
`.aiassistant/rules/` when they are relevant to the files you are changing.

## Useful commands

- Fast validation: `pnpm check:fast`
- Full validation: `pnpm check`
- Repo validation: `pnpm check:repo`
- Format check: `pnpm biome:format:check`
- Lint/typecheck/typegen: `pnpm biome:lint`, `pnpm typecheck`, `pnpm next:typegen`
- Unit tests: `pnpm test`
- E2E tests: `pnpm cy:e2e`

## Safety and context

- Do not read, print, or commit local environment files such as `.env*.local`.
- Avoid sending generated artifacts, dependency folders, build output, logs, coverage, or database dumps to AI tools.
- Treat `database/`, `drizzle/`, and `devtools/` as project code, not disposable generated output.
