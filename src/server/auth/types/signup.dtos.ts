import "server-only";
import type {
  PasswordHash,
  PasswordRaw,
} from "@/server/auth/types/password.types";
import type { UserEntity } from "@/server/users/types/entity";

/**
 * Public form input for signup: raw password, no role.
 */
export interface AuthSignupFormInput {
  readonly email: string;
  readonly username: string;
  readonly password: PasswordRaw;
}

/**
 * Service-level normalized input (post-validation), still raw password.
 */
export interface AuthSignupServiceInput {
  readonly email: string;
  readonly username: string;
  readonly password: PasswordRaw;
  // Future: add inviteCode, tenantId, etc., if needed.
}

/**
 * Input for the auth-signup DAL: expects server-determined role and pre-hashed password.
 * Decouples DAL from public shapes and prevents raw password reaching persistence.
 */
export interface AuthSignupDalInput {
  readonly email: string;
  readonly username: string;
  readonly passwordHash: PasswordHash;
  readonly role: UserEntity["role"];
}
