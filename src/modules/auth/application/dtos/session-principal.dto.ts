import "server-only";

import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";

/**
 * Minimal identity used by the application layer to establish/refresh sessions.
 * Derived from AuthUserEntity to ensure identity and role consistency.
 */
export type SessionPrincipalDto = Readonly<Pick<AuthUserEntity, "id" | "role">>;
