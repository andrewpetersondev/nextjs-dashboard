// File: src/shared/config/public-env.client.ts

/** biome-ignore-all lint/correctness/noProcessGlobal: <centralized env file> */
/** biome-ignore-all lint/style/noProcessEnv: <centralized env file> */
import { z } from "zod";
import { getNodeEnv } from "@/shared/config/env-shared";
import { type LogLevel, LogLevelSchema } from "@/shared/logging/log-level";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_LOG_LEVEL: LogLevelSchema.optional(),
});

/**
 * Parse and validate public (browser-exposed) environment variables.
 * Throws early with a readable error if invalid.
 */
function parsePublicEnv(): Readonly<z.infer<typeof PublicEnvSchema>> {
  const parsed = PublicEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid public environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
    );
  }
  return Object.freeze(parsed.data);
}

const PUBLIC_ENV = parsePublicEnv();

/** Effective Node environment derived once and reused. */
const NODE_ENV = getNodeEnv();

/** Exported, browser-safe values */
export const NEXT_PUBLIC_LOG_LEVEL = PUBLIC_ENV.NEXT_PUBLIC_LOG_LEVEL as
  | LogLevel
  | undefined;

export const IS_PROD: boolean = NODE_ENV === "production";

// Testing-only reset (no-op for browser bundles, provided for SSR tests)
export function __resetPublicEnvCacheForTests__(): void {
  // Intentionally empty: relies on module reload in tests; provided for symmetry.
}
