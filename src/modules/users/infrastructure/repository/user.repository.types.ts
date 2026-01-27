import "server-only";

import type { Hash } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

export type UserPersistencePatch = {
  email?: string;
  password?: Hash;
  role?: UserRole;
  username?: string;
};
