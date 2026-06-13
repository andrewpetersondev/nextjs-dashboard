# TypeScript config strategy

## Mental model

Use these three questions:

1. **Where does the code run?** -> runtime
2. **Why does this config exist?** -> layer
3. **Which config owns these files?** -> leaf project

## Core definitions

| Term         | Meaning                                    | Quick test                                                                      |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------- |
| Runtime      | The execution environment                  | Would this change for browser vs Node vs test?                                  |
| Layer        | The config's role in the inheritance stack | Does this exist to describe the graph, share policy, or share runtime defaults? |
| Leaf project | A real TS project that owns files          | Does it have `include` or otherwise clearly own files?                          |

## Repo map

Two real config files — shared policy is layered in from presets, not from local base files:

| Config                  | Layer       | Runtime            | Owns files | Purpose                                                                                   |
| ----------------------- | ----------- | ------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| `tsconfig.json`         | Root config | Next + Node + test | Yes        | Extends the `@tsconfig/bases` presets; owns app, database, root tooling, and Vitest files |
| `cypress/tsconfig.json` | Leaf        | Cypress            | Yes        | Extends the root; owns Cypress files                                                      |

There is intentionally **no** `tsconfig.base.json` / `*.node` / `*.app` / `*.test` split — shared policy comes from
the `@tsconfig/bases` presets, so the repo needs only the root project and the one Cypress leaf.

## Base layers

The root `tsconfig.json` composes its defaults from
[`@tsconfig/bases`](https://www.npmjs.com/package/@tsconfig/bases) (pinned at `^1.0.25`), extended in this order —
later layers win:

| Layer (`@tsconfig/bases/…`) | What it contributes                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `recommended`               | Baseline: `strict`, `esModuleInterop`, `forceConsistentCasingInFileNames`, `skipLibCheck`                      |
| `strictest`                 | Maximal type-safety flags (`noUncheckedIndexedAccess`, `isolatedModules`, `noUnused*`, …)                      |
| `node-lts`, `node24`        | Node 24 runtime: `es2024` lib/target, `module: nodenext`, `moduleResolution: node16`                           |
| `node-ts`                   | TS 5.8+ ergonomics: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `rewriteRelativeImportExtensions`            |
| `next`                      | Next.js: DOM libs, `module: esnext`, `moduleResolution: bundler`, `jsx: preserve`, `plugins: [next]`, `noEmit` |

On top of the presets, the root then sets `target: esnext` and `jsx: react-jsx`, declares the path aliases (`@/*`,
`@cypress/*`, `@database/*`, `@devtools/*`) and explicit `types`, and relaxes three `strictest` flags
(`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`).

For the exact contents of each preset, read them in `@tsconfig/bases` — a copy pasted here would drift the moment the
package updates.

## What goes where

| Config                  | Should contain                                               | Should not contain                               |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `tsconfig.json`         | root ownership, shared aliases, repo-wide compiler overrides | Cypress-only ownership                           |
| `cypress/tsconfig.json` | Cypress config, support, and E2E test ownership              | app, database, root tooling, or Vitest ownership |

## Where a new setting belongs

| If you are deciding...        | Ask...                                        | Put it in...                                  |
| ----------------------------- | --------------------------------------------- | --------------------------------------------- |
| A widely-shared default       | Is it a standard, framework-agnostic rule?    | a `@tsconfig/bases` preset (via `extends`)    |
| A repo-wide override or alias | True for the whole repo, but not in a preset? | root `tsconfig.json` `compilerOptions`        |
| A Next/Node app setting       | Specific to the app here?                     | root `tsconfig.json` (the single app project) |
| A Cypress-only setting        | Only for E2E specs?                           | `cypress/tsconfig.json` (the leaf)            |
| File ownership                | Which project should own this file?           | the config whose `include` covers it          |

## File ownership guide

| File type                                       | Owner                   |
| ----------------------------------------------- | ----------------------- |
| App code under `src/**`                         | `tsconfig.json`         |
| `next-env.d.ts` and Next-generated app types    | `tsconfig.json`         |
| Root Node-run config/tool files                 | `tsconfig.json`         |
| Database code                                   | `tsconfig.json`         |
| Files under `devtools/**`                       | `tsconfig.json`         |
| Vitest config, setup, and test-support files    | `tsconfig.json`         |
| Cypress config, support, and Cypress test files | `cypress/tsconfig.json` |

Vitest infrastructure intentionally stays in the root config rather than a dedicated
`tsconfig.vitest.json`. The single root config matches the Next.js TypeScript setup and avoids IDE ownership conflicts
for files that share app, Node, and test concerns.

## Runtime signals

If a setting depends on execution environment, it is a runtime concern.

| Runtime concern examples |
| ------------------------ |
| `lib`                    |
| `types`                  |
| `module`                 |
| `moduleResolution`       |
| `jsx`                    |
| framework plugins        |

These belong in a runtime-owning project (here, the root or the Cypress leaf), not in a shared base preset.

## Leaf signals

A config is usually a leaf project if it has one or more of these:

| Signal                                          |
| ----------------------------------------------- |
| `include`                                       |
| `exclude`                                       |
| `references` to real projects                   |
| `composite` because other projects reference it |
| clear ownership of a file boundary              |

Today the Cypress config is the only leaf, and it composes via `extends` rather than project `references`.

## Project references rules

| Good reason for a reference                         | Bad reason for a reference                 |
| --------------------------------------------------- | ------------------------------------------ |
| One real project imports another real project       | Two configs happen to extend the same base |
| A project needs another project's types/build graph | A config is only an inheritance layer      |

This repo doesn't currently use project `references` — the Cypress leaf just `extends` the root.

## Short summary

| Term    | Remember it as          |
| ------- | ----------------------- |
| Runtime | where code runs         |
| Layer   | why the config exists   |
| Leaf    | which config owns files |

## One-line rule

Shared policy comes from the **`@tsconfig/bases` presets**; repo-wide overrides and file ownership live in the **root
`tsconfig.json`**; Cypress-only concerns live in the **`cypress/tsconfig.json` leaf**.
