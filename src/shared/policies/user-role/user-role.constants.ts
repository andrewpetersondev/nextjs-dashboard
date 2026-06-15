export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Optional: keep these only if you genuinely use them elsewhere.
// If not used, delete them to reduce surface area.
export const ADMIN_ROLE: UserRole = "ADMIN";
export const GUEST_ROLE: UserRole = "GUEST";
export const USER_ROLE: UserRole = "USER";
