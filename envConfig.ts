/**
 * @file envConfig.ts
 * @description
 * `@next/env` ALLOWS YOU TO USE ENV VARIABLES OUTSIDE OF THE NEXT.JS RUNTIME (aka `src` directory).
 * When does this project need to use `env` variables outside of the `src` directory while in the runtime?
 * - Drizzle
 *   - Who, what, when, why, where, and how does it use drizzle outside of the runtime?
 *   - Drizzle is located in the `scripts` directory and `src/server/db` directory.
 *   - `scripts`
 *     - DEVELOPMENT
 *       - `drizzle-dev.config.ts` (used for Drizzle Kit development operations)
 *       - `db-dev.ts`
 *     - TESTING
 * - Cypress config
 */

import { loadEnvConfig } from "@next/env";

// biome-ignore lint/suspicious/useAwait: <not shown in nextjs docs>
export default async () => {
  // biome-ignore lint/correctness/noProcessGlobal: <temp>
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
};

// const projectDir = process.cwd();
// loadEnvConfig(projectDir);
