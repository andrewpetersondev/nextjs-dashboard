import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";

/**
 * Transport / boundary DTOs related to sessions.
 */
export interface SessionTransport {
  isAuthorized: true;
  role: UserRole;
  userId: string;
}
