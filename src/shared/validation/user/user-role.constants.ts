export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_ROLE = "ADMIN";
export const GUEST_ROLE = "GUEST";
export const USER_ROLE = "USER";
