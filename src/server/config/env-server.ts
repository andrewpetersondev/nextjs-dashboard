/**
 * @file Server-only environment configuration for Next.js runtime
 * - Validates and exposes secrets
 * - Shared env values are imported from `@/shared/config/env-shared`
 */

import "server-only";
import type { z } from "zod";
import { ServerEnvSchema } from "@/shared/config/env-schemas";
import { mapEnvVars } from "@/shared/config/env-utils";

let cachedServerEnv: Readonly<z.infer<typeof ServerEnvSchema>> | undefined;

// biome-ignore lint/nursery/useExplicitType: fix
function parseServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  // Use centralized env mapping from shared config
  const envToValidate = mapEnvVars({
    authBcryptSaltRounds: "AUTH_BCRYPT_SALT_ROUNDS",
    databaseUrl: "DATABASE_URL",
    sessionAudience: "SESSION_AUDIENCE",
    sessionIssuer: "SESSION_ISSUER",
    sessionSecret: "SESSION_SECRET",
  });

  const parsed = ServerEnvSchema.safeParse(envToValidate);

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid or missing server environment variables. See details:\n${JSON.stringify(
        details,
        null,
        2,
      )}`,
    );
  }

  cachedServerEnv = Object.freeze(parsed.data);
  return cachedServerEnv;
}

/** Export validated server-only variables */
// biome-ignore lint/nursery/useExplicitType: fix
const env = parseServerEnv();

export const AUTH_BCRYPT_SALT_ROUNDS: number = env.authBcryptSaltRounds;
export const DATABASE_URL: string = env.databaseUrl;
export const SESSION_SECRET: string = env.sessionSecret;
export const SESSION_ISSUER: "my-app" = env.sessionIssuer;
export const SESSION_AUDIENCE: "web" = env.sessionAudience;
