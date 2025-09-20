export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLE: UserRole = "ADMIN";
export const GUEST_ROLE: UserRole = "GUEST";
export const USER_ROLE: UserRole = "USER";
