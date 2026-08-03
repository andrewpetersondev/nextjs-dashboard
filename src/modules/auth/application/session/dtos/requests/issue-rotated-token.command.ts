import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * Command to issue a rotated session token.
 *
 * `sid` must be provided to keep session identity stable across token rotation.
 * `authTime` must be carried over from the current token — it anchors the absolute
 * session ceiling, which `iat` cannot, because rotation always mints a fresh `iat`.
 */
export type IssueRotatedTokenCommand = {
	readonly authTime: number;
	readonly role: UserRole;
	readonly sid: string;
	readonly userId: UserId;
};
