import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * Command to create a demo user.
 */
export type CreateDemoUserCommand = Readonly<{
  role: UserRole;
}>;
