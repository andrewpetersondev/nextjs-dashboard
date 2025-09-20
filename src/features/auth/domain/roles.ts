export const ROLES = {
  ADMIN: "ADMIN",
  GUEST: "GUEST",
  USER: "USER",
} as const;

export type AuthRole = (typeof ROLES)[keyof typeof ROLES];

export const AUTH_ROLES = Object.values(ROLES) as readonly AuthRole[];

export const USER_ROLES = Object.freeze(["ADMIN", "GUEST", "USER"] as const);
export type UserRole = (typeof USER_ROLES)[number];
