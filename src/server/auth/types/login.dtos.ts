import "server-only";
import type { PasswordRaw } from "@/server/auth/types/password.types";

/**
 * Public form input for login: raw password.
 */
export interface AuthLoginFormInput {
  readonly email: string;
  readonly password: PasswordRaw;
}

/**
 * Service-level normalized input (post-validation), still raw password.
 */
export interface AuthLoginServiceInput {
  readonly email: string;
  readonly password: PasswordRaw;
}

/**
 * Repository/DAL input for login: raw password is verified against stored hash.
 * We do NOT pass hashes around for login.
 */
export interface AuthLoginDalInput {
  readonly email: string;
}
