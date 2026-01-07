import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Domain Policy: Default Registration Role.
 */
export function getDefaultRegistrationRole(): UserRole {
  return parseUserRole("USER");
}

/**
 * Domain Policy: Demo User Identity Generation.
 */
export function generateDemoUserIdentity(
  role: UserRole,
  counter: number,
): { email: string; username: string } {
  return {
    email: `demo+${role}${counter}@demo.com`,
    username: `Demo_${role.toUpperCase()}_${counter}`,
  };
}
