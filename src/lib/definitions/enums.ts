import { z as zod } from "@/src/lib/definitions/zod-alias.ts";

// --- User Roles ---
export const USER_ROLES = ["admin", "user", "guest"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Role: enum of allowed roles (required).
 */
export const roleSchema = zod.enum(USER_ROLES, {
	// required_error: "Role is required.", // todo: will this property break my code?
	// biome-ignore lint/style/useNamingConvention: "Using zod enum for role validation."
	invalid_type_error: "Invalid user role.",
});

// Invoice statuses as a constant tuple for type safety.
export const INVOICE_STATUSES = ["pending", "paid"] as const;

/**
 * Type for invoice statuses.
 * Uses a tuple to ensure only valid statuses are used.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
