import type { UserRole } from "@/modules/auth/domain/auth.roles";
import type { UserId } from "@/shared/branding/brands";

// Minimal user payload embedded into session tokens.
export interface SessionUser {
  readonly id: UserId;
  readonly role: UserRole;
}
