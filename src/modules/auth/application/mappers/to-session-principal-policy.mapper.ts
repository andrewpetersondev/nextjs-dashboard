import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";

/**
 * Domain Policy: Maps authentication outputs to SessionPrincipalDto.
 *
 * Handles:
 * 1. AuthenticatedUserDto - direct mapping of identity
 * 2. UpdateSessionSuccessDto - rotation outcome with branded userId
 *
 */
export function toSessionPrincipalPolicy(
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
