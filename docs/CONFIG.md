# Information for Configuration Files at Project Root

## biome.json

- linter.domains.project setting may cause slow IDE performance.
- Not configured for Testing yet.

## cypress.config.ts

## drizzle-dev.config.ts & drizzle-test.config.ts

- These files are used for command line operations.

## envConfig.ts

- Next.js documentation shows two variations of this file.
- One If you need to load environment variables outside of the Next.js runtime, such as in a root config file for an ORM or test runner. This package is used internally by Next.js to load environment variables from .env\* files.

```ts
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);
```

- AND one for `TEST` Environment Variables.
- Apart from development and production environments, there is a 3rd option available: `test`.
- In the same way you can set defaults for development or production environments, you can do the same with a .env.test file for the testing environment (though this one is not as common as the previous two).
- Next.js will not load environment variables from .env.development or .env.production in the testing environment.
- This one is useful when running tests with tools like jest or cypress where you need to set specific environment vars only for testing purposes.
- Test default values will be loaded if NODE_ENV is set to test, though you usually don't need to do this manually as testing tools will address it for you.
- There is a small difference between test environment, and both development and production that you need to bear in mind: .env.local won't be loaded, as you expect tests to produce the same results for everyone.
- This way every test execution will use the same env defaults across different executions by ignoring your .env.local (which is intended to override the default set).
- Good to know: similar to Default Environment Variables, .env.test file should be included in your repository, but .env.test.local shouldn't, as .env\*.local are intended to be ignored through .gitignore.
- While running unit tests you can make sure to load your environment variables the same way Next.js does by leveraging the loadEnvConfig function from the @next/env package.

```ts
// The below can be used in a Jest global setup file or similar for your testing set-up
import { loadEnvConfig } from "@next/env";

export default async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
};
```

Environment Variable Load Order

Environment variables are looked up in the following places, in order, stopping once the variable is found.

`process.env`
`.env.$(NODE_ENV).local`
`.env.local (Not checked when NODE_ENV is test.)`
`.env.$(NODE_ENV)`
`.env`
For example, if NODE_ENV is development and you define a variable in both .env.development.local and .env, the value in .env.development.local will be used.

Good to know: The allowed values for `NODE_ENV` are `production`, `development` and `test`.

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
