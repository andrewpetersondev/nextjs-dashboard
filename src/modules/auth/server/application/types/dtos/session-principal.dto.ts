import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Minimal identity used by the application layer to establish/refresh sessions.
 *
 * This is a DTO used at the workflow and service boundaries.
 */
export interface SessionPrincipalDto {
  readonly id: UserId;
  readonly role: UserRole;
}
