import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/responses/session-principal.dto";

/**
 * Maps an authenticated user to the canonical session principal.
 *
 * @remarks
 * Pure mapper (no business rules). Extracts the minimal identity (`id`, `role`)
 * needed for JWT claims — the principle of least privilege for session tokens.
 */
export function toSessionPrincipal(
	source: AuthenticatedUserDto,
): SessionPrincipalDto {
	return {
		id: source.id,
		role: source.role,
	};
}
