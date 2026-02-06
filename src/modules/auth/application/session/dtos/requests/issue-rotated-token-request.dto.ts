import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/validation/user/user-role.schema";

/**
 * Request to issue a rotated session token.
 *
 * `sid` must be provided to keep session identity stable across token rotation.
 */
export type IssueRotatedTokenRequestDto = {
  readonly role: UserRole;
  readonly sid: string;
  readonly userId: UserId;
};
