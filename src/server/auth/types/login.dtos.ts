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
 * Input for the auth-login DAL: expects pre-hashed password.
 * Decouples DAL from public shapes and prevents raw password reaching persistence.
 */
export interface AuthLoginDalInput {
  readonly email: string;
  readonly password: string;
}
