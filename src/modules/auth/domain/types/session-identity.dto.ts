import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

// todo:  why does this shape have no properties that are specific to sessions, cookies, or tokens?

/**
 * Minimal identity used by the application layer to establish/refresh sessions.
 */
export interface SessionIdentityDto {
  readonly id: UserId;
  readonly role: UserRole;
}

// todo: consider expanding to include session state and renaming or creating SessionPrincipalDto
