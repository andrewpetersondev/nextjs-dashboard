/**
 * Roles as the database knows them, backing the `pgEnum` on `users.role`.
 *
 * The app declares its own copy in `src/shared/policies/user-role/`, so this
 * layer stays independent of `src/`. Nothing links the two — if you add a role,
 * change both, and note that a Postgres enum value can be added but never
 * removed.
 */
export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

/** Union of {@link USER_ROLES}. Shadows the app-side `UserRole`; check the import path. */
export type UserRole = (typeof USER_ROLES)[number];

/** Role assigned when a row does not specify one. */
export const DEFAULT_USER_ROLE: UserRole = "USER";

export const ADMIN_ROLE: UserRole = "ADMIN";
export const GUEST_ROLE: UserRole = "GUEST";
export const USER_ROLE: UserRole = "USER";

/**
 * Stored statuses only — "overdue" is a derived display state, never persisted
 * (see `src/modules/invoices/domain/statuses/`).
 *
 * Postgres enum values cannot be removed (`ALTER TYPE` has no `DROP VALUE`), so
 * additions here are one-way; append new values LAST so drizzle-kit emits a
 * plain `ADD VALUE`.
 */
export const INVOICE_STATUSES = ["pending", "paid", "void"] as const;

/** Union of {@link INVOICE_STATUSES} — persisted statuses, excluding "overdue". */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
