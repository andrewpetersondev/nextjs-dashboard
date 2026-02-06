import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/validation/user/user-role.schema";

// TODO:  why does this shape have no properties that are specific to sessions, cookies, or tokens?

/**
 * Represents the minimal identity of a user within a session.
 *
 * This DTO is used by the application layer to identify the user
 * associated with a session and to authorize operations based on their role.
 */
export interface SessionPrincipalDto {
  /** The unique identifier of the user. */
  readonly id: UserId;
  /** The role assigned to the user. */
  readonly role: UserRole;
}

// TODO: consider expanding to include session state and renaming or creating SessionPrincipalDto
