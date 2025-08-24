import { z } from "zod";
import { AUTH_ROLES } from "@/shared/auth/roles";

export const userIdSchema: z.ZodUUID = z.uuid();
export const expiresAtSchema: z.ZodNumber = z.number();

// User role validation schema.
export const roleSchema = z.enum(AUTH_ROLES, {
  error: (issue) =>
    issue.input === undefined ? "Role is required." : "Invalid user role.",
});

export const EncryptPayloadSchema = z.object({
  user: z.object({
    expiresAt: expiresAtSchema,
    role: roleSchema,
    userId: userIdSchema,
  }),
});
