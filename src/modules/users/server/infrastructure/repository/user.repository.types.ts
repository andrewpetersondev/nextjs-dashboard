import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";

export type UserPersistencePatch = {
  email?: string;
  password?: PasswordHash;
  role?: UserRole;
  username?: string;
};
