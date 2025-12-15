import "server-only";

import type { UserRole } from "@/modules/auth/shared/user/auth.roles";
import type { UserId } from "@/shared/branding/brands";

/**
 * Minimal identity used by the application layer to establish/refresh sessions.
 *
 * This is NOT a UI transport type; it is a workflow/service boundary type.
 */
export interface SessionPrincipal {
  readonly id: UserId;
  readonly role: UserRole;
}
