export const ROLES = {
  ADMIN: "admin",
  GUEST: "guest",
  USER: "user",
} as const;

export const ADMIN_ROLE = ROLES.ADMIN;

export type AuthRole = (typeof ROLES)[keyof typeof ROLES];
export const AUTH_ROLES = Object.values(ROLES) as readonly AuthRole[];
