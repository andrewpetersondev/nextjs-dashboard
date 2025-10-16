import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { UserId } from "@/shared/domain/domain-brands";

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
