import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Minimal identity used by the application layer to establish/refresh sessions.
 *
 * This is NOT a UI transport type; it is a workflow/service boundary type.
 */
export interface SessionPrincipal {
  readonly id: UserId;
  readonly role: UserRole;
}
