import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/server/auth/domain/types/password.types";

/**
 * Input for the auth-signup DAL: expects server-determined role and pre-hashed password.
 * Decouples DAL from public shapes and prevents raw password reaching persistence.
 */
export interface AuthSignupDalInput {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
}

export type AuthSignupRepoInput = {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
};

export type AuthSignupRepoInputPlain = {
  readonly email: string;
  readonly password: string;
  readonly role: string;
  readonly username: string;
};
