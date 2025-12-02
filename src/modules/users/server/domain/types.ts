import "server-only";

import type { UserEntity } from "@/modules/users/server/domain/entity";

export type UserUpdatePatch = Partial<
  Pick<UserEntity, "username" | "email" | "role" | "password">
>;
