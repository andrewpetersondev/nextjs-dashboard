import "server-only";

// Branded types to prevent raw/hash mixups.
import type { UserEntity } from "@/server/users/types/entity";

export type PasswordRaw = string & { readonly __brand: "PasswordRaw" };
export type PasswordHash = string & { readonly __brand: "PasswordHash" };

// Public form input for signup: raw password, no role.
export interface AuthSignupFormInput {
  readonly email: string;
  readonly username: string;
  readonly password: PasswordRaw;
}

// Service-level normalized input (post-validation), still raw password.
export interface AuthSignupServiceInput {
  readonly email: string;
  readonly username: string;
  readonly password: PasswordRaw;
  // Future: add inviteCode, tenantId, etc., if needed.
}

// Input for the auth-signup DAL: expects server-determined role and pre-hashed password.
// This decouples DAL from public shapes and prevents raw password reaching persistence.
export interface AuthSignupDalInput {
  readonly email: string;
  readonly username: string;
  readonly passwordHash: PasswordHash;
  readonly role: UserEntity["role"];
}

// Utility constructors to apply brands in a single place.
export const asPasswordRaw = (value: string): PasswordRaw =>
  value as PasswordRaw;
export const asPasswordHash = (value: string): PasswordHash =>
  value as PasswordHash;
/**
 * Legacy types kept for migration. Prefer the new interfaces above.
 * @deprecated Use AuthSignupFormInput/AuthSignupServiceInput/AuthSignupDalInput instead.
 */
export type AuthLoginDalInput = Pick<UserEntity, "email" | "password">;
