import "server-only";
import type {
  PasswordHash,
  PasswordRaw,
} from "@/server/auth/types/password.types";
import type { UserEntity } from "@/server/users/types/entity";

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
  readonly username: string;
  readonly passwordHash: PasswordHash;
  readonly role: UserEntity["role"];
}
