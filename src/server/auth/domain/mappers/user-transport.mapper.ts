import "server-only";
import { toUserRole } from "@/features/users/lib/to-user-role";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import { toUserId } from "@/shared/domain/id-converters";

export const toAuthUserTransport = (src: {
  readonly email: string;
  readonly id: string;
  readonly role: string;
  readonly username: string;
}): AuthUserTransport => ({
  email: String(src.email),
  id: toUserId(String(src.id)),
  role: toUserRole(String(src.role)),
  username: String(src.username),
});
