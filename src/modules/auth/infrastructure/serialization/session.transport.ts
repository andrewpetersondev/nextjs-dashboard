import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Transport / boundary DTOs related to sessions.
 */
export interface SessionTransport {
  isAuthorized: true;
  role: UserRole;
  userId: string;
}
