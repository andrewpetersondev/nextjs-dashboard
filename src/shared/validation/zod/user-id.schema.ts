import { z } from "zod";
import type { UserId } from "@/shared/branding/brands";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * UserId boundary schema (UUID string ⇄ branded UserId).
 */
export const UserIdSchema = z.codec(z.uuid(), z.custom<UserId>(), {
  decode: (id: string) => toUserId(id),
  encode: (userId: UserId) => String(userId),
});
