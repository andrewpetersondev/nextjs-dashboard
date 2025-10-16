import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/server/auth/domain/types/password.types";

// DAL input after hashing and role resolution.
export interface AuthSignupDalInput {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
}

// Repository input within server boundary.
export interface AuthSignupRepoInput {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
}

// Edge-only plain variant when adapting external sources.
export interface AuthSignupRepoInputPlain {
  readonly email: string;
  readonly password: string;
  readonly role: string;
  readonly username: string;
}
