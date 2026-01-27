import "server-only";
import { AUTH_BCRYPT_SALT_ROUNDS } from "@/server/config/env-server";

/**
 * Configuration for authentication-related cryptography.
 */
export interface AuthCryptoConfig {
  /**
   * The number of salt rounds to use for bcrypt hashing.
   */
  readonly bcryptSaltRounds: number;
}

/**
 * Retrieves the authentication cryptography configuration from environment variables.
 *
 * @returns The authentication cryptography configuration.
 */
export function getAuthCryptoConfig(): AuthCryptoConfig {
  return {
    bcryptSaltRounds: AUTH_BCRYPT_SALT_ROUNDS,
  };
}
