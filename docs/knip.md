# Knip

[Knip](https://knip.dev) finds **dead code** — unused files, exports, types, and
dependencies — by building an import graph from a set of entry points.

## Running it

```sh
pnpm knip          # static analysis — no env vars or database needed
pnpm check:repo    # the full gate: pnpm check (lint+types+tests+e2e) && pnpm knip
```

Knip parses source statically; it never executes the app, so it does **not** need a
running database or `.env` file. (It is intentionally kept env-free — see the drizzle
note below.) Knip is **not** part of CI (`.github/workflows/ci.yml` runs `check:fast`
only); run it locally, or let the `weekly-maintenance` `/schedule` routine report new
findings each week.

Exit code `1` just means "findings were reported" — it is not a crash.

## How this repo configures it (`knip.json`)

- **`project`** — every folder Knip should analyze for dead code: `src/`, `devtools/`,
  `cypress/`, `test-support/`, `database/`, and root `*.{ts,mjs}`. A `.ts` file inside
  these that no entry reaches is reported as an **unused file**.
- **`entry`** — the roots Knip starts from (never themselves "unused"): the Next.js app
  (`src/app/**`), all tests (`src/**/__tests__/**`), the devtools CLIs, the Cypress
  config/specs/support, and `drizzle.config.ts`.
- **Plugins** — `cypress` and `drizzle` plugin blocks tune detection for those tools.

### Two non-obvious entries (don't remove without reading this)

- **`database/schema/relations.ts`** is listed as an `entry` even though no TypeScript
  file imports it. drizzle-kit consumes the whole `./database/schema` directory by path
  (`schema: "./database/schema"` in `drizzle.config.ts`), so `relations.ts` is live at
  migration time but invisible to the import graph. Without the entry, Knip would
  false-flag it as unused.
- The **`drizzle` plugin is left with `"config": []`** (disabled config discovery) on
  purpose: `drizzle.config.ts` throws `"DATABASE_URL is not set."` at module load, so
  letting the plugin load it would force every `knip` run to provide env. Disabling it
  keeps `pnpm knip` env-free; the `relations.ts` entry above covers what the plugin
  would otherwise have contributed.

## Acting on findings

Triage each finding — not everything reported should be deleted:

- **Genuinely dead** → delete (e.g. leftovers from the gutted revenues module:
  `REVENUE_SOURCES`, `RevenueSource`, `RevenueId`).
- **Intentionally kept** → leave it. The repo uses a leading `_` to mark
  deliberately-unused symbols (e.g. `_NewInvoiceRow` insert types, `_isDev`); Knip does
  not honor that convention, so these show up as noise.
- **Config-only / peer dependencies** → not real dead deps. `dotenv` (used via scripts),
  `tailwindcss` (PostCSS config), and `@testing-library/dom` (a peer of
  `@testing-library/cypress`) are never imported in code. `tailwindcss` and
  `@testing-library/dom` are silenced via `ignoreDependencies` in `knip.json`, so they no
  longer surface; `dotenv` is not ignored, so it can still appear — leave it.

The running triage list lives in `BACKLOG.md` ("knip full-report triage").
