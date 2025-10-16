import "server-only";
import type { PasswordHash } from "@/server/auth/domain/types/password.types";
import type { UserEntity } from "@/server/users/types/entity";

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
