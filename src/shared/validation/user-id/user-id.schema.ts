import { z } from "zod";
import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * UserId boundary schema (UUID string ⇄ branded UserId).
 */
// biome-ignore lint/nursery/useExplicitType: <fix later>
export const UserIdSchema = z.codec(z.uuid(), z.custom<UserId>(), {
  decode: (id: string) => toUserId(id),
  encode: (userId: UserId) => String(userId),
});
