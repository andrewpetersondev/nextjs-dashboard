# Getting Started

This guide helps you set up, run, and develop the Next.js Dashboard locally.

Prereqs

- Node >= 24
- PNPM >= 10.12
- PostgreSQL (local or remote)

1) Install dependencies

- pnpm install

2) Configure environment
   Create the appropriate .env files at the project root. Common files:

- .env.development.local
- .env.test.local
- .env.production.local

Minimal variables (adjust to your setup):

- DATABASE_URL=postgres://user:pass@localhost:5432/nextjs_dashboard
- SESSION_SECRET=change-me
- NODE_ENV=development

See docs/environment-variables.md for details and optional flags.

3) Prepare the database
   Run migrations and seeds for your target environment.

- Development
    - pnpm db:generate:migrate:dev
    - pnpm db:seed:dev
- Test
    - pnpm db:generate:migrate:test
    - pnpm db:seed:test
- Production
    - pnpm db:generate:migrate:prod
    - pnpm db:seed:prod

4) Start the app

- Development (Turbopack):
    - pnpm dev
- Production-like (standalone build):
    - pnpm standalone
    - # or, if already built
    - pnpm start:standalone

5) Running tests

- Build (test env): pnpm build:test
- Serve (test env): pnpm serve:test
- Cypress (open): pnpm cyp:open
- Cypress (headless): pnpm cyp:e2e:headless

Tips

- If you see build anomalies, try pnpm clean then pnpm build.
- Ensure DATABASE_URL points to a reachable database and that migrations have run.
- Auth requires SESSION_SECRET to be set. See docs/auth.md for flow details.

---
_Last updated: 2025-10-04_
_Author: GitHub Copilot_
