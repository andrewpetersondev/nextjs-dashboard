# Next.js Dashboard

A modern dashboard application built with Next.js (App Router), TypeScript, Drizzle ORM, and Tailwind CSS. It includes authentication, middleware-based route protection, database migrations/seeding, and end-to-end tests with Cypress.

Last updated: 2025-12-13

## Tech Stack

- Next.js 16 (App Router, Server/Client Components)
- React 19 + TypeScript 5 (strict)
- Drizzle ORM (PostgreSQL)
- Tailwind CSS v4
- Cypress for E2E testing (with @testing-library/cypress and cypress-axe)
- Biome and Prettier for formatting and checks
- Turbopack for dev/build

Note: ESLint is not used in this project, by design.

## Project Structure

```
nextjs-dashboard/
├── cypress/                # E2E specs and support
├── docs/                   # Additional documentation (see docs/auth.md for auth flow)
├── drizzle/                # Generated SQL, migrations, meta
├── devtools/               # cli, config, seed-support, tasks
├── public/                 # Static assets
├── src/                    # Application source
│   ├── app/                # App router
│   ├── modules/            # auth, customers, invoices, revenues, users
│   ├── server/             # config, db, events
│   ├── shared/             # branding, config, errors, forms, http,  logging, result, routes, utilities
│   ├── shell/              # dashbaord-wide components/screens/
│   ├── ui/                 # atoms, brand, feedback, forms, molecules, navigation, styles
│   ├── proxy.ts       # Route protection
└── ...
```

## Requirements

- Node >= 24
- PNPM >= 10.12
- PostgreSQL (local or remote)

## Getting Started

1. Install dependencies

   ```sh
   pnpm install
   ```

2. Configure environment

   Create environment files as needed (these are referenced by scripts):
   - .env.development.local
   - .env.test.local
   - .env.production.local

   Typical variables (adapt to your setup):
   - DATABASE_URL=postgres://user:pass@localhost:5432/nextjs_dashboard
   - SESSION_SECRET=change-me
   - NODE_ENV=development

3. Database: generate, migrate, seed

   Run against your desired environment using dotenv-powered helpers:
   - Development
     ```sh
     pnpm db:generate:migrate:dev
     pnpm db:seed:dev
     ```
   - Test
     ```sh
     pnpm db:generate:migrate:test
     pnpm db:seed:test
     ```
   - Production (ensure variables are set correctly)
     ```sh
     pnpm db:generate:migrate:prod
     pnpm db:seed:prod
     ```

4. Start the app
   - Development server (Turbopack):
     ```sh
     pnpm dev
     ```
   - Build + start (standalone):
     ```sh
     pnpm standalone
     # or, if already built
     pnpm start:standalone
     ```

## Testing

- Build App:
  ```sh
  pnpm build:test
  ```
- Start App:

  ```sh
  pnpm serve:test
  ```

- Open Cypress (E2E):
  ```sh
  pnpm cyp:open
  ```
- Run Cypress headless (CI-friendly):
  ```sh
  pnpm cyp:e2e:headless
  ```

Accessibility checks via cypress-axe are integrated in tests where applicable.

## Useful Scripts

- Formatting and checks (Biome):
  - "pnpm biome:format" — format code
  - "pnpm biome:check" — run checks
  - "pnpm biome:summary" — summary reporter
- Clean builds:
  - "pnpm clean" — remove .next
  - "pnpm clean:all" — clean + node_modules (will require reinstall)
- Env helpers (wrap commands with specific env files):
  - env:dev, env:test, env:prod

See package.json for the full list of scripts.

## Conventions

- TypeScript: strict types everywhere; prefer inference but annotate boundaries.
- Components: prefer Server Components; use Client Components when necessary (hooks, interactivity).
- File/function sizing (project guidelines):
  - Files ≤ 200 lines where practical.
  - Functions ≤ 50 lines, ≤ 4 parameters, avoid excessive complexity.
- Secrets: never commit; use environment variables. Vault is not required.

## Troubleshooting

- Build uses Turbopack. If you hit unexpected behavior, try a clean build:
  ```sh
  pnpm clean && pnpm build
  ```
- Database issues: confirm DATABASE_URL and that migrations have run.
- Auth issues: ensure SESSION_SECRET is set and consistent across processes.
