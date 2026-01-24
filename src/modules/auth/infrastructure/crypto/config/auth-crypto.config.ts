import "server-only";
import { AUTH_BCRYPT_SALT_ROUNDS } from "@/server/config/env-server";

export interface AuthCryptoConfig {
  readonly bcryptSaltRounds: number;
}

export function getAuthCryptoConfig(): AuthCryptoConfig {
  return {
    bcryptSaltRounds: AUTH_BCRYPT_SALT_ROUNDS,
  };
}
