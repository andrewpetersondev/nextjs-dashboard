// File: src/server/auth/types/session-action.types.ts
import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { UserId } from "@/shared/domain/domain-brands";

/**
 * Input to establishSessionAction action. Shared across auth actions to avoid inline types.
 */
export type EstablishSessionInput = {
  readonly id: string;
  readonly role: string;
};

// Minimal user payload embedded into session tokens.
export interface SessionUser {
  readonly id: UserId;
  readonly role: UserRole;
}
