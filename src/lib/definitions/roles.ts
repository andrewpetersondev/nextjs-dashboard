import { z as zod } from "@/src/lib/definitions/zod-alias";

// --- User Roles ---
export const USER_ROLES = ["admin", "user", "guest"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Role: enum of allowed roles (required).
 */
export const roleSchema = zod.enum(USER_ROLES, {
	// required_error: "Role is required.", // todo: will this property break my code?
	invalid_type_error: "Invalid user role.",
});
