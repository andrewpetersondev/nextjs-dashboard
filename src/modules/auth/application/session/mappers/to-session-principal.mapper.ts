import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/authenticated-user.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/session-principal.dto";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/session/dtos/update-session-outcome.dto";

/**
 * Maps authentication or session update outputs to a session principal.
 *
 * @remarks
 * This is a pure mapper (no business rules). It consolidates multiple successful
 * outcomes into the canonical `SessionPrincipalDto` shape.
 */
export function toSessionPrincipal(
  source: AuthenticatedUserDto | UpdateSessionSuccessDto,
): SessionPrincipalDto {
  if ("email" in source) {
    // Mapping from AuthenticatedUserDto
    return {
      id: source.id,
      role: source.role,
    };
  }

  // Mapping from UpdateSessionSuccessDto (already has branded userId)
  return {
    id: source.userId,
    role: source.role,
  };
}
