import type { UserRole } from "@/modules/auth/domain/user/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.types";
import type { UserId } from "@/shared/branding/brands";

/**
 * Remember that this is a copy of UserEntity
 */
export interface AuthUserEntity {
  readonly email: string;
  readonly id: UserId;
  readonly password: Hash;
  readonly role: UserRole;
  readonly sensitiveData: string;
  readonly username: string;
}

// Repo expects only email for login; password verified elsewhere.
export interface AuthLoginRepoInput {
  readonly email: string;
}

/**
 * Unified signup payload used across Service → Repo → DAL boundaries.
 * Keeps strong types (Hash, UserRole).
 */
export interface AuthSignupPayload {
  readonly email: string;
  readonly password: Hash;
  readonly role: UserRole;
  readonly username: string;
}

/**
 * Lightweight transport shape for authenticated user responses.
 * Kept in domain/types to decouple service layer from UI-facing DTOs.
 */
export interface AuthUserTransport {
  readonly email: string;
  readonly id: UserId;
  readonly role: UserRole;
  readonly username: string;
}
