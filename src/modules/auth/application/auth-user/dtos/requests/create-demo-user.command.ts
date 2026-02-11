import type { UserRole } from "@/shared/validation/user-role/user-role.constants";

/**
 * Command to create a demo user.
 */
export type CreateDemoUserCommand = Readonly<{
  role: UserRole;
}>;
