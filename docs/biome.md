# Biome

Biome is the linter and formatter for everything except Markdown (see
[`AGENTS.md`](../AGENTS.md) for why Markdown uses markdownlint + dprint instead).

```bash
pnpm biome:lint
```

## The warning slate is zero, and that is the contract

Since 2026-08-31 `pnpm biome:lint` runs `biome check --error-on-warnings`, so **a warning
now fails the command** — and with it `check`, `check:fast`, and the CI lint job, which all
call this script. That is deliberate: the slate had been enforced only by a human reading
output, and a regression duly reached `main` past a green local run.

Two things the flag does **not** change, both of which still bite:

- **Infos still exit 0.** Rules configured at info level (for example
  `noExcessiveLinesPerFunction`) are invisible to the exit code, and the contract here is
  zero diagnostics of _any_ severity. For infos, reading the printed slate is still the only
  check.
- **Bare `biome check` is unchanged.** The flag lives on the npm script, so `pnpm exec biome
  check` and any ad-hoc invocation still exit 0 on warnings. Prefer `pnpm biome:lint`.

The repo has stood at zero warnings and zero infos since 2026-07-30, so any new diagnostic
is a regression introduced by the change in front of you, not background noise to step over.

⚠ **A clean run only means something if the rules could actually run.** Biome's type-aware
rules (`noUnnecessaryConditions`, `noFloatingPromises`) need a resolvable `node_modules`;
when they cannot resolve types they emit **nothing** rather than failing, and Biome then
reports their still-correct `biome-ignore` comments as `suppressions/unused`. That symmetry
is what makes it dangerous — it hides the rule _and_ accuses its suppression. Before acting
on a `suppressions/unused` warning, confirm `ls -l node_modules/@types/node` points inside
the project rather than at a temp directory. Note also that `biome check <single-file>`
skips the project-wide pass and can report a file clean that a full run flags.

## Why `biome.json` has no comments explaining its rules

It cannot have them. Biome's config loader rejects a `//` comment in `biome.json` — a
full lint run fails outright with one present (verified 2026-08-04). Neither Biome nor
dprint formats `biome.json` either, so nothing would catch the mistake locally. That is
why per-rule rationale lives in this file rather than beside the setting.

## Rules deliberately disabled

Three rules are `"off"` on purpose. Each was trial-run across the whole repo on
2026-08-04 with `biome check --only=<rule>`, and the counts below are what that produced.
**Every finding was a false positive** — none indicated a real defect.

| Rule                                   | Findings | Why it stays off                                                     |
| -------------------------------------- | -------- | -------------------------------------------------------------------- |
| `correctness/noUndeclaredDependencies` | 227      | Reads TypeScript **path aliases** as scoped npm packages             |
| `correctness/noUnresolvedImports`      | 4        | Cannot resolve `cypress` and `react`, both installed and tsc-clean   |
| `correctness/useImportExtensions`      | 1977     | Wants file extensions on every import — wrong model for this project |

### `noUndeclaredDependencies` — 227 findings, all path aliases

Every finding is an alias resolving to a real directory in this repo, which Biome reports
as a missing package: `@database/schema` (86), `@cypress/e2e` (58), `@cypress/node` (24),
`@devtools/seed` (21), `@test-support/*` (23), and other `@devtools/*` (15). Biome does
not read the `paths` mapping, so it sees `@database/schema` and looks for a published
package by that name.

Enabling it would mean either abandoning the alias convention or suppressing 227 sites.
Reconsider only if Biome learns to resolve TS path aliases.

### `noUnresolvedImports` — 4 findings, all resolvable

All four are ordinary imports of installed packages: `cypress` in `cypress.config.ts`, and
`react` in three components (`import { type JSX, Suspense } from "react"`). Both packages
are declared and both typecheck under `tsc -b`, so Biome's resolver simply disagrees with
TypeScript's here. A rule that flags `react` as unresolved cannot be trusted to flag a
genuine one.

### `useImportExtensions` — 1977 findings, wrong model

This rule targets projects that ship native ESM resolved by the runtime, where
`./foo.js` must be written in full. This project's imports are resolved by the bundler and
by TypeScript path aliases, so extensionless specifiers are correct. Enabling it would
rewrite nearly every import in the repo to no benefit.

## Rules enabled on 2026-08-04

Both had previously been `"off"` with no rationale, and both are now enforced:

- **`noInferrableTypes`** — drops redundant annotations (`query: string = ""` →
  `query = ""`).
- **`useConsistentArrayType`** — pins the shorthand form, which the codebase already used
  nearly everywhere. The 11 stragglers were `ReadonlyArray<T>` → `readonly T[]`, an
  identical type.

Enabling them produced 22 findings, all auto-fixable, all fixed in the same change. Note
that Biome classifies the `ReadonlyArray` rewrite as an **unsafe** fix, so it needs
`--write --unsafe`; scope it with `--only` rather than applying every unsafe fix in the
repo at once.

## Adding or enabling a rule

Trial it before deciding — the whole-repo count is the deciding fact:

```bash
pnpm exec biome check --only=correctness/someRule --max-diagnostics=300
```

Beware one trap that produced a wrong answer during this audit: filtering that output for
`Found N errors` **misses `Found N infos`**, and many rules report at info level. Read the
summary line as printed.
