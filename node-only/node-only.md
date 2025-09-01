# Sharing server-safe logic with Cypress (without duplication)

Goal: Keep a single source of truth for secure utilities (e.g., hashPassword) that:
- Can be used by Next.js server code (server-only)
- Can be used by Cypress tasks (Node process)
- Cannot be imported by client/browser code

## Structure

- Put the real implementation in a Node-only, framework-agnostic module:
    - src/node-only/auth/password.ts
- Re-export it from a server-only file for app usage:
    - src/server/auth/password.ts
- Import the Node-only module directly from Cypress tasks:
    - cypress.config.ts (setupNodeEvents)

## Example

```ts
// src/node-only/auth/password.ts (single source of truth)
import bcryptjs from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
}
```


```ts
// src/server/auth/password.ts (server-only facade)
import "server-only"; // or: "use server"
export { hashPassword } from "@/node-only/auth/password";
```


```ts
// cypress.config.ts (Node process - tasks)
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    async setupNodeEvents(on) {
      on("task", {
        async "e2e:hashPassword"(password: string) {
          const { hashPassword } = await import("./src/node-only/auth/password");
          return hashPassword(password);
        },
      });
    },
  },
});
```


## Guardrails

- Don’t import src/node-only/** from client components or Cypress browser specs.
- Optionally add an ESLint rule (no-restricted-imports) to forbid client/browser code importing src/node-only/**.
- If using TS path aliases in cypress.config.ts, ensure they resolve, or use relative imports.

## Why this works

- One implementation, no duplication.
- Next.js server code stays “server-only” via the facade.
- Cypress tasks run in Node and import the shared implementation directly, bypassing server-only restrictions.
