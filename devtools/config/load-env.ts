// File: devtools/config/load-env.ts

// biome-ignore lint/style/noRestrictedImports: <explanation>
import process from "node:process";
import dotenv from "dotenv";

/**
 * Side-effect loader for CLIs.
 * If you already run the command via `dotenv -e ... --`, this is harmless.
 * Otherwise it will load .env files from the current working directory.
 */
if (!process.env.__DOTENV_LOADED) {
  dotenv.config();
  // mark loaded to avoid double-loading in the same process
  // (helps when tests or other tools import this file multiple times)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.env as any).__DOTENV_LOADED = "1";
}

export const DOTENV_LOADED = true;

// Usage: import this file as the very first import in CLI entrypoints
// e.g. in `devtools/cli/seed-cli.ts` and `devtools/cli/reset-cli.ts`
