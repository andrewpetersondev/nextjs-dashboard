export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const DEFAULT_USER_ROLE: UserRole = "USER";
export const ADMIN_ROLE: UserRole = "ADMIN";
export const GUEST_ROLE: UserRole = "GUEST";
export const USER_ROLE: UserRole = "USER";

// Stored statuses only — "overdue" is a derived display state, never persisted
// (see src/modules/invoices/domain/statuses/). Postgres enum values cannot be
// removed (ALTER TYPE has no DROP VALUE), so additions here are one-way; append
// new values LAST so drizzle-kit emits a plain ADD VALUE.
export const INVOICE_STATUSES = ["pending", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
