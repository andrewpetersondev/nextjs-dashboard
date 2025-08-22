/**
 * List of allowed user roles.
 * @readonly
 */
export const USER_ROLES = ["admin", "user", "guest"] as const;

/**
 * Union type for user roles.
 * @example
 * const role: UserRole = "admin";
 */
export type UserRole = (typeof USER_ROLES)[number];

// UI-facing shapes (e.g., UserListItem, UserFormValues)
