import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";

export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: UserRole;
  username?: string;
}

/**
 * Input type for creating a user via service.
 * Accepts raw strings for password and role, which are processed/hashed internally.
 */
export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  username: string;
}
