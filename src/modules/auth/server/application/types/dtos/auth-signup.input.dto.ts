import "server-only";

import type { AuthUserEntity } from "@/modules/auth/server/application/types/models/auth-user.entity";

/**
 * Unified signup payload used across Use-Case → Repo → DAL boundaries.
 * Derived from AuthUserEntity to ensure type consistency for identity and credentials.
 */
export type AuthSignupInputDto = Readonly<Omit<AuthUserEntity, "id">>;
