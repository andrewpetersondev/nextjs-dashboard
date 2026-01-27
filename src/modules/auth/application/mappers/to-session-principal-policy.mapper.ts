import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";

/**
 * Maps authentication or session update outputs to a session principal.
 *
 * This function serves as a domain policy mapper that extracts the core
 * identity (ID and role) from various output DTOs to create a unified
 * session principal.
 *
 * @param source - The source DTO (either from login/signup or session rotation).
 * @returns The session principal DTO.
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
