import "server-only";
import type { UserEntity } from "@/server/users/types/entity";

/**
 * Legacy types kept for migration. Prefer the new interfaces above.
 * @deprecated Use AuthSignupFormInput/AuthSignupServiceInput/AuthSignupDalInput instead.
 */
export type AuthSignupDalInput = Pick<
  UserEntity,
  "email" | "username" | "password" | "role"
>;
