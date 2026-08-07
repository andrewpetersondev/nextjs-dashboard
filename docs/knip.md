# Knip

[Knip](https://knip.dev) finds **dead code** — unused files, exports, types, and
dependencies — by building an import graph from a set of entry points.

## Running it

```sh
pnpm knip          # static analysis — no env vars or database needed
pnpm check         # the full gate; knip runs inside it, after db:drift
```

Knip parses source statically; it never executes the app, so it does **not** need a
running database or `.env` file. (It is intentionally kept env-free — see the drizzle
note below.)

**Knip is a blocking gate as of 2026-08-06** — a `Dead code` step in the CI
`Lint & type-check` job, and a link in the `pnpm check` chain. Before that it ran only via
`pnpm check:repo`, which **nothing executed**: not `check`, not `check:fast`, not CI. It
drifted red unnoticed and was found carrying four stale findings. That is the same
"wired into no pipeline" flaw that killed an earlier standalone typecheck script, so
`check:repo` was deleted rather than left as a name nobody types — `pnpm check` is now a
true superset of it. The `weekly-maintenance` routine still reports findings, but a weekly
report is a lagging indicator: it never blocked the drift it was meant to catch.

It is not in `check:fast`. That gate is the pre-commit loop, and mid-feature code
legitimately has an export whose consumer does not exist yet; blocking every commit on
that trains you to bypass the gate. Knip costs ~1s, so its placement is about workflow,
not speed.

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
- **`entry` looks like it under-covers tests, and does not.** It lists
  `src/**/__tests__/**`, so the four test files under `devtools/**` appear to be
  undeclared graph roots that Knip should false-flag as unused files. It does not report
  them: Knip's **vitest plugin** derives test entries from `vitest.config.ts`, which
  covers them already. Verified by running it — do not "fix" this by widening the glob.
  (Biome's test-file override had the genuine version of this bug and was widened on
  2026-08-06; the two configs look alike but only one was broken.)
- The **`drizzle` plugin is left with `"config": []`** (disabled config discovery) on
  purpose: `drizzle.config.ts` throws `"DATABASE_URL is not set."` at module load, so
  letting the plugin load it would force every `knip` run to provide env. Disabling it
  keeps `pnpm knip` env-free; the `relations.ts` entry above covers what the plugin
  would otherwise have contributed.

### CSS is deliberately outside the project globs

The `project` globs match only `.{ts,tsx,mjs}`, so Knip never follows `.css` imports and
cannot report an unused stylesheet. **This was evaluated and deliberately retired on
2026-08-04**, not left as an oversight: the repo has exactly **one** CSS file,
`src/app/globals.css`, imported by the root layout. Widening the globs would buy Knip the
ability to check a single file whose liveness is self-evident.

Revisit only if CSS files multiply — CSS Modules, or per-route stylesheets — because at
that point an orphaned stylesheet becomes possible and invisible.

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
