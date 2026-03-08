# TypeScript config strategy

## Mental model

Use these three questions:

1. **Where does the code run?**  
   That is the **runtime**.

2. **What role does this config play in the stack?**  
   That is the **layer**.

3. **Which config actually owns these files?**  
   That is the **leaf project**.

## Quick definitions

### Runtime

Runtime means the execution environment.

Examples:

- browser / Next app
- Node
- Vitest
- Cypress

Runtime affects settings like:

- `lib`
- `types`
- `module`
- `moduleResolution`
- `jsx`
- framework plugins

Rule:

- if a setting changes based on where code runs, it is a runtime concern

### Layer

Layer means the architectural role of a `tsconfig`.

Examples:

- solution layer
- base policy layer
- Node runtime layer
- test runtime layer
- leaf project layer

Rule:

- a layer explains **why the config exists**
- a layer does **not** necessarily own files

### Leaf project

A leaf project is a real TypeScript project that owns files.

Typical signs:

- has `include`
- may have `exclude`
- may be `composite`
- may have `references`

Rule:

- if a config owns real files, it is a leaf project

## Repo model

### `tsconfig.json`

**Role:** solution layer  
**Owns files:** no  
**Purpose:** describe the repo project graph

Should contain:

- `files: []`
- `references`

Should not contain:

- `include`
- `exclude`
- runtime settings

## `tsconfig.base.json`

**Role:** base policy layer  
**Owns files:** no  
**Purpose:** shared repo-wide rules

Should contain:

- aliases like `baseUrl` and `paths`
- strictness and safety rules
- repo-wide non-runtime defaults

Good examples:

- `strict`
- `noEmit`
- `isolatedModules`
- `skipLibCheck`
- `resolveJsonModule`

Should not contain:

- `lib`
- `module`
- `moduleResolution`
- `jsx`
- `types`
- Node-only or browser-only assumptions

Rule:

- if it depends on runtime, it usually does not belong here

## `tsconfig.node.json`

**Role:** Node runtime layer  
**Owns files:** no  
**Purpose:** shared Node settings for Node-executed projects

Should contain:

- Node runtime defaults
- `@tsconfig/node-lts`
- Node-specific compiler settings

Good examples:

- `types: ["node"]`
- Node `module`
- Node `moduleResolution`
- Node `lib`

Should not contain:

- file ownership
- app-only settings

## `tsconfig.app.json`

**Role:** app runtime layer + leaf project  
**Owns files:** yes  
**Purpose:** own the Next app source boundary

Owns:

- `src/**`
- `next-env.d.ts`
- Next-generated types

Should contain:

- app `include`
- app `exclude`
- app-only overrides
- `@tsconfig/next`
- references needed by the app

Rule:

- if a file is part of the app source graph, it belongs here

## `tsconfig.test.json`

**Role:** test runtime layer  
**Owns files:** no  
**Purpose:** shared test defaults for test projects

Should contain:

- only small test-wide adjustments shared by multiple test leafs

Should not contain:

- `include`
- file ownership
- tool-specific settings unless all test projects need them

Rule:

- keep this file small

## Other leaf projects

### `tsconfig.database.json`

Owns database code.

### `tsconfig.root-tools.json`

Owns root Node-run config/tooling files.

### `devtools/tsconfig.json`

Owns `devtools/**`.

### `tsconfig.vitest.json`

Owns Vitest config, setup, and Vitest test files.

### `cypress/tsconfig.json`

Owns Cypress config, support, and Cypress test files.

## Fast decision rules

### For a setting

Ask:

1. Is this true for the whole repo?  
   -> put it in `tsconfig.base.json`

2. Is this true for all Node-executed code?  
   -> put it in `tsconfig.node.json`

3. Is this true only for the app?  
   -> put it in `tsconfig.app.json`

4. Is this true only for shared test behavior?  
   -> put it in `tsconfig.test.json`

### For file ownership

Ask:

1. Which project should own this file?
2. Where does this file run?
3. Does another config already own it?

Rule:

- every file should have one clear owning leaf project

## Short summary

- **runtime** = where code runs
- **layer** = why the config exists
- **leaf** = which config owns files

In this repo:

- `tsconfig.json` = solution layer
- `tsconfig.base.json` = base policy layer
- `tsconfig.node.json` = Node runtime layer
- `tsconfig.test.json` = test runtime layer
- `tsconfig.app.json` = app runtime layer + app leaf project

## One-line rule

Put:

- **shared policy** in base
- **runtime behavior** in runtime layers
- **file ownership** in leaf projects