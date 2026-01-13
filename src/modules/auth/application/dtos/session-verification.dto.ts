import "server-only";

import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Result of a session verification check.
 * This is an Application DTO used to communicate authorization state to the presentation layer.
 *
 * TODO: this is used in 2 ui components. should i create a more ui friendly version? this is pretty ui friendly
 * since UserRole is an enum.
 */
export interface SessionVerificationDto {
  readonly isAuthorized: boolean;
  readonly role: UserRole;
  readonly userId: string;
}
