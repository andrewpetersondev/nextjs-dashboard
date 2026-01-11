import "server-only";

import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";

// todo: should this use AuthenticatedUserDto instead?  why does this shape have no properties
//  that are specific to sessions, cookies, or tokens?

/**
 * Minimal identity used by the application layer to establish/refresh sessions.
 * Derived from AuthUserEntity to ensure identity and role consistency.
 */
export type SessionIdentityDto = Readonly<Pick<AuthUserEntity, "id" | "role">>;

// todo: consider expanding to include session state and renaming or creating SessionPrincipalDto
