import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * Everything that goes into a session token's claims.
 *
 * Role is captured at issue time, so a role changed in the database does not
 * take effect until the session is rotated or re-established — that staleness
 * window is the trade-off for not hitting the database on every request.
 */
export type IssueTokenCommand = Readonly<{
	role: UserRole;
	userId: UserId;
}>;
