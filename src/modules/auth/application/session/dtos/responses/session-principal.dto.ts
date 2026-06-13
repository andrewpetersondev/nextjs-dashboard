import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * The minimal user identity that a session authenticates — the *principal*.
 *
 * @remarks
 * This shape carries no session-, cookie-, or token-specific fields by design.
 * In security terms a "principal" is the actor being authenticated (the user),
 * not the session machinery itself. Restricting it to `id` + `role` enforces
 * the principle of least privilege for JWT claims: the token embeds only what
 * authorization decisions require, and nothing sensitive that could leak if the
 * token is decoded.
 *
 * Session/token mechanics — expiry, rotation, cookie storage, claim encoding —
 * live in the session service and infrastructure layer, deliberately kept off
 * this DTO. Expanding it with session state would conflate identity with
 * transport and widen the token surface, so that is intentionally avoided.
 */
export interface SessionPrincipalDto {
	/** The unique identifier of the user. */
	readonly id: UserId;
	/** The role assigned to the user. */
	readonly role: UserRole;
}
