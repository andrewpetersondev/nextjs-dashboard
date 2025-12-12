import "server-only";
import type { UserRole } from "@/modules/auth/domain/schema/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.types";

export type UserPersistencePatch = {
  email?: string;
  password?: Hash;
  role?: UserRole;
  username?: string;
};
