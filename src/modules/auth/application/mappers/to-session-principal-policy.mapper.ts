import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import type { SessionIdentityDto } from "@/modules/auth/domain/types/session-identity.dto";

/**
 * Domain Policy: Maps authentication outputs to SessionIdentityDto.
 *
 * Handles:
 * 1. AuthenticatedUserDto - direct mapping of identity
 * 2. UpdateSessionSuccessDto - rotation outcome with branded userId
 *
 * @deprecated For SessionTokenClaims, use toSessionEntity() + toReadSessionOutcome() instead
 */
export function toSessionPrincipalPolicy(
  source: AuthenticatedUserDto | UpdateSessionSuccessDto,
): SessionIdentityDto {
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
