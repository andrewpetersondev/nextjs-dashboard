import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";

/**
 * Unified signup payload used across Use-Case → Repo → DAL boundaries.
 * Derived from AuthUserEntity to ensure type consistency for identity and credentials.
 */
export type AuthUserCreateDto = Readonly<Omit<AuthUserEntity, "id">>;
