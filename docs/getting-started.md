# Getting Started

This guide helps you set up, run, and develop the Next.js Dashboard locally.

## Prerequisites

- Node 24 (pinned in [`.nvmrc`](../.nvmrc); CI reads the version from it, and `pnpm node:drift` asserts it matches `package.json` `engines.node` and the `Dockerfile`)
- pnpm 11 (pinned via the `packageManager` field in [`package.json`](../package.json))
- PostgreSQL (local or remote)

## 1. Install Node and pnpm

Install and select the pinned Node version. Run `nvm use` from the repo root with no argument —
it reads [`.nvmrc`](../.nvmrc), so it stays correct when the pin moves:

```sh
nvm install 24
```

```sh
nvm use
```

Then let **corepack** provide pnpm. Don't install pnpm with `npm i -g pnpm`, Homebrew, or the
`get.pnpm.io` script: `packageManager` pins an exact pnpm build _and its `+sha512` integrity hash_,
and corepack is what fetches that build and verifies it. A hand-installed pnpm is whatever version
you happened to get, free to drift from the pin with nothing checking. Corepack is also what CI
(`pnpm/action-setup`) and the [`Dockerfile`](../Dockerfile) use, so all three agree:

```sh
corepack enable pnpm
```

```sh
pnpm --version
```

That should print the version pinned in `packageManager`. If it does, corepack is wired up.

> **Two gotchas.**
>
> - **Corepack shims are per-Node-install.** They live inside
>   `~/.nvm/versions/node/<version>/bin/`, so `pnpm` will be missing after you install or switch to
>   a new Node — re-run `corepack enable pnpm` each time.
> - **Node 25 and later no longer bundle corepack** (Node 24 still does). If you are ever on 25+,
>   run `npm install -g corepack@latest` first.

Corepack prompts before downloading a package manager. To skip it, add
`export COREPACK_ENABLE_DOWNLOAD_PROMPT=0` to your shell profile.

## 2. Install Dependencies

```sh
pnpm install
```

## 3. Configure Environment

Copy [`.env.example.local`](../.env.example.local) to one file per environment, then fill in real values:

- `.env.development.local` — `DATABASE_ENV=development`, `DATABASE_URL` ending in `/dev_db`
- `.env.test.local` — `DATABASE_ENV=test`, `DATABASE_URL` ending in `/test_db`
- `.env.production.local` — `DATABASE_ENV=production`, `DATABASE_URL` ending in `/prod_db`

At minimum each file needs a reachable `DATABASE_URL` and a `SESSION_SECRET`; see the example for the full list.

## 4. Prepare the Database

First, stand up PostgreSQL and create the per-environment databases — see [database-setup.md](database-setup.md). If you already have a database, make sure your `DATABASE_URL` points at it.

Then run migrations and seeds for your target environment.

**Development:**

```sh
pnpm db:push:dev
pnpm db:seed:dev
```

**Test:**

```sh
pnpm db:push:test
pnpm db:seed:test
```

**Production:**

```sh
pnpm db:push:prod
CONFIRM_PROD_DB=yes pnpm db:seed:prod
```

Destructive DB tasks (seed/reset) refuse to run against production without the explicit
`CONFIRM_PROD_DB=yes` opt-in.

## 5. Start the App

**Development (Turbopack):**

```sh
pnpm next:dev
```

**Production-like (standalone build):**

```sh
pnpm serve:standalone
```

Or, if already built:

```sh
pnpm next:start:standalone
```

## 6. Running Tests

```sh
pnpm next:build:test # Build with test env
pnpm serve:test      # Serve with test env
pnpm cy:e2e:open        # Open Cypress interactive runner
pnpm cy:e2e:run  # Run Cypress headless
```

See [testing.md](testing.md) for the full E2E workflow.

## Tips

- If you see build anomalies, try `pnpm clean` then `pnpm next:build`.
- Ensure `DATABASE_URL` points to a reachable database and that migrations have run.
- Auth requires `SESSION_SECRET` to be set and consistent across processes.
