import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/validation/user-role/user-role.constants";

/**
 * Command to issue a rotated session token.
 *
 * `sid` must be provided to keep session identity stable across token rotation.
 */
export type IssueRotatedTokenCommand = {
  readonly role: UserRole;
  readonly sid: string;
  readonly userId: UserId;
};
