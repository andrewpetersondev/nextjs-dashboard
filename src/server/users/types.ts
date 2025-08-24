import "server-only";

import type { UserEntity } from "@/server/users/entity";

export type UserUpdatePatch = Partial<
  Pick<UserEntity, "username" | "email" | "role" | "password">
>;
