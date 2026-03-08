# TypeScript config strategy

## Goal

Refactor the repo into a solution-style TypeScript setup with:

- one root solution config
- clear leaf-project configs
- shared inheritance layers
- eventual project references between real projects only

## Current direction

### Root solution

`tsconfig.json` should represent the repo, not the app.

It should:

- own no source files
- use `files: []`
- keep only references to real projects
- avoid referencing inheritance-only configs

Referenced projects currently include:

- `./cypress`
- `./devtools`
- `./tsconfig.app.json`
- `./tsconfig.database.json`
- `./tsconfig.root-tools.json`
- `./tsconfig.vitest.json`

## Ownership rules

### App project

`tsconfig.app.json` owns app-source files:

- `src/**`
- `next-env.d.ts`
- Next-generated type files

It should not own root Node config files.

### Root tools project

`tsconfig.root-tools.json` owns root-level Node-executed config/tooling files, such as:

- `next.config.ts`
- `drizzle.config.ts`

Rule:

- if a file is executed as config/tooling by Node, it belongs here
- if a file is part of the app source graph, it belongs in the app config

### Vitest project

`tsconfig.vitest.json` owns the Vitest boundary:

- `vitest.config.ts`
- `vitest.setup.ts`
- test files under `src`

### Cypress project

`cypress/tsconfig.json` owns the Cypress boundary:

- `cypress.config.ts`
- Cypress test/support files

## Keep in mind

The root `tsconfig.json` should describe the project graph, not the inheritance graph.

That means:

- reference real projects
- do not reference base configs just because other configs extend them

## Likely next steps

- review whether each referenced project is reference-ready
- later add project-to-project references where real dependencies exist