import type { UserRole } from "@/shared/validation/user/user-role.constants";

/**
 * Represents the result of a session verification check.
 *
 * This DTO is used to communicate the authentication and authorization
 * status of a user session to the presentation layer.
 */
export interface SessionVerificationDto {
  /** Indicates if the session is valid and authorized. */
  readonly isAuthorized: boolean;
  /** The role of the user associated with the session. */
  readonly role: UserRole;
  /** The unique identifier of the user as a string. */
  readonly userId: string;
}
