export const ROLES = {
  ADMIN: "admin",
  GUEST: "guest",
  USER: "user",
} as const;

export type AuthRole = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLE = ROLES.ADMIN;
