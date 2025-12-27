import "server-only";

import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.value";

export type UserPersistencePatch = {
  email?: string;
  password?: Hash;
  role?: UserRole;
  username?: string;
};
