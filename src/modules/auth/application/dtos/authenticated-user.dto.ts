import "server-only";

import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";

/**
 * Data payload returned by Auth Use Cases.
 * Derived from AuthUserEntity, omitting sensitive password hash.
 */
export type AuthenticatedUserDto = Readonly<Omit<AuthUserEntity, "password">>;
