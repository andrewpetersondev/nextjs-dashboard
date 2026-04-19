import { z } from "zod";
import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import { toUserId } from "@/modules/users/domain/user-id.mappers";

/**
 * UserId boundary schema (UUID string ⇄ branded UserId).
 */
export const UserIdSchema = z.codec(z.uuid(), z.custom<UserId>(), {
	decode: (id: string) => toUserId(id),
	encode: (userId: UserId) => String(userId),
});
