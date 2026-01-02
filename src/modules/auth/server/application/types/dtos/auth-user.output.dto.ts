import "server-only";

import type { AuthUserEntity } from "@/modules/auth/server/application/types/models/auth-user.entity";

/**
 * Data payload returned by Auth Use Cases.
 * Derived from AuthUserEntity, omitting sensitive password hash.
 */
export type AuthUserOutputDto = Readonly<Omit<AuthUserEntity, "password">>;
