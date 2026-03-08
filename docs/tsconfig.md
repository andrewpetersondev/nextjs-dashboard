# TypeScript config strategy

## Mental model

Use these three questions:

1. **Where does the code run?** -> runtime
2. **Why does this config exist?** -> layer
3. **Which config owns these files?** -> leaf project

## Core definitions

| Term         | Meaning                                    | Quick test                                                                      |
|--------------|--------------------------------------------|---------------------------------------------------------------------------------|
| Runtime      | The execution environment                  | Would this change for browser vs Node vs test?                                  |
| Layer        | The config's role in the inheritance stack | Does this exist to describe the graph, share policy, or share runtime defaults? |
| Leaf project | A real TS project that owns files          | Does it have `include` or otherwise clearly own files?                          |

## Rule of thumb

| If you are deciding... | Ask...                                   | Put it in...         |
|------------------------|------------------------------------------|----------------------|
| A shared compiler rule | Is this true for the whole repo?         | `tsconfig.base.json` |
| A Node runtime setting | Is this true for all Node-run code?      | `tsconfig.node.json` |
| An app-only setting    | Is this true only for the Next app?      | `tsconfig.app.json`  |
| A shared test setting  | Is this true for multiple test projects? | `tsconfig.test.json` |
| File ownership         | Which project should own this file?      | A leaf config        |

## Repo map

| Config                     | Layer                | Runtime      | Owns files | Purpose                          |
|----------------------------|----------------------|--------------|------------|----------------------------------|
| `tsconfig.json`            | Solution             | None         | No         | Describes the repo project graph |
| `tsconfig.base.json`       | Base policy          | None         | No         | Shared repo-wide compiler policy |
| `tsconfig.node.json`       | Runtime layer        | Node         | No         | Shared Node defaults             |
| `tsconfig.test.json`       | Runtime layer        | Test         | No         | Shared test defaults             |
| `tsconfig.app.json`        | Runtime layer + leaf | Next/browser | Yes        | Owns app source files            |
| `tsconfig.database.json`   | Leaf                 | Node         | Yes        | Owns database code               |
| `tsconfig.root-tools.json` | Leaf                 | Node         | Yes        | Owns root config/tool files      |
| `devtools/tsconfig.json`   | Leaf                 | Node         | Yes        | Owns `devtools/**`               |
| `tsconfig.vitest.json`     | Leaf                 | Vitest       | Yes        | Owns Vitest files                |
| `cypress/tsconfig.json`    | Leaf                 | Cypress      | Yes        | Owns Cypress files               |

## What goes where

| Config               | Should contain                                                           | Should not contain                                               |
|----------------------|--------------------------------------------------------------------------|------------------------------------------------------------------|
| `tsconfig.json`      | `files: []`, `references`                                                | `include`, `exclude`, runtime options                            |
| `tsconfig.base.json` | aliases, strictness, safety rules, non-runtime defaults                  | `lib`, `module`, `moduleResolution`, `jsx`, `types`              |
| `tsconfig.node.json` | Node defaults, `@tsconfig/node-lts`, Node compiler options               | file ownership, app-only options                                 |
| `tsconfig.app.json`  | app `include`/`exclude`, app overrides, `@tsconfig/next`, app references | root tooling ownership, Cypress ownership, Vitest-only ownership |
| `tsconfig.test.json` | small shared test adjustments                                            | `include`, tool-specific ownership                               |

## File ownership guide

| File type                                       | Owner                      |
|-------------------------------------------------|----------------------------|
| App code under `src/**`                         | `tsconfig.app.json`        |
| `next-env.d.ts` and Next-generated app types    | `tsconfig.app.json`        |
| Root Node-run config/tool files                 | `tsconfig.root-tools.json` |
| Database code                                   | `tsconfig.database.json`   |
| Files under `devtools/**`                       | `devtools/tsconfig.json`   |
| Vitest config, setup, and Vitest test files     | `tsconfig.vitest.json`     |
| Cypress config, support, and Cypress test files | `cypress/tsconfig.json`    |

## Runtime signals

If a setting depends on execution environment, it is a runtime concern.

| Runtime concern examples |
|--------------------------|
| `lib`                    |
| `types`                  |
| `module`                 |
| `moduleResolution`       |
| `jsx`                    |
| framework plugins        |

These usually belong in runtime layers or leaf projects, not in `tsconfig.base.json`.

## Leaf signals

A config is usually a leaf project if it has one or more of these:

| Signal                                          |
|-------------------------------------------------|
| `include`                                       |
| `exclude`                                       |
| `references` to real projects                   |
| `composite` because other projects reference it |
| clear ownership of a file boundary              |

## Project references rules

| Good reason for a reference                         | Bad reason for a reference                 |
|-----------------------------------------------------|--------------------------------------------|
| One real project imports another real project       | Two configs happen to extend the same base |
| A project needs another project's types/build graph | A config is only an inheritance layer      |

## Fast checklist

| Question                                 | If yes                                           |
|------------------------------------------|--------------------------------------------------|
| Is this about the repo as a whole?       | Use `tsconfig.json` or `tsconfig.base.json`      |
| Is this runtime-specific?                | Put it in a runtime layer or runtime-owning leaf |
| Does this config own files?              | It is a leaf project                             |
| Is this just shared inheritance?         | Keep it fileless                                 |
| Could `@tsconfig/*` define this already? | Prefer the preset                                |

## Short summary

| Term    | Remember it as          |
|---------|-------------------------|
| Runtime | where code runs         |
| Layer   | why the config exists   |
| Leaf    | which config owns files |

## One-line rule

Put **shared policy** in base, **runtime behavior** in runtime layers, and **file ownership** in leaf projects.