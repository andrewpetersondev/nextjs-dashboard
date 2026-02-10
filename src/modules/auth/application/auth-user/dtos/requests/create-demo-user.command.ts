import type { UserRole } from "@/shared/validation/user/user-role.constants";

/**
 * Command to create a demo user.
 */
export type CreateDemoUserCommand = Readonly<{
  role: UserRole;
}>;
