import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Data payload returned by Auth Use Cases.
 * Uses branded types for internal application safety.
 */
export interface AuthUserOutputDto {
  readonly email: string;
  readonly id: UserId;
  readonly role: UserRole;
  readonly username: string;
}
