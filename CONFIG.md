# Information for Configuration Files at Project Root

## biome.json

- linter.domains.project setting may cause slow IDE performance.
- Not configured for Testing yet.

## cypress.config.ts

## drizzle-dev.config.ts & drizzle-test.config.ts

- These files are used for command line operations.

## envConfig.ts

- Contains environment variables for the application.
- I do not know if this file is used in the project, or if it is needed.

## eslint.config.mjs

- My project favors biome over eslint.
- This file is used for occasional IDE support and tasks.
- Sometimes used for Builds.

## package.json

## pnpm-workspace.yaml

- This file is used for pnpm workspaces.
- Can I remove this file?

## postcss.config.mjs

- Does the new tailwind need this file?

## tsconfig.json

- sets strict rules for typescript.

## General Notes

- I used to have separate tsconfigs, biome configs, and eslint configs for `src`, and `cypress` but am temporarily not
  running tests so my configs are favored to the `src` directory.
