import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";

/**
 * Data payload representing a successfully authenticated user.
 *
 * This DTO is derived from the `AuthUserEntity` but omits sensitive
 * information like the password hash, making it safe to pass through
 * the application and presentation layers.
 */
export type AuthenticatedUserDto = Readonly<Omit<AuthUserEntity, "password">>;
