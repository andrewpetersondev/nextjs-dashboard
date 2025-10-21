import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { UserId } from "@/shared/domain/domain-brands";

// Minimal user payload embedded into session tokens.
export interface SessionUser {
  readonly id: UserId;
  readonly role: UserRole;
}
