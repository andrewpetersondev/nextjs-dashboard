import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { SessionIdentityDto } from "@/modules/auth/application/dtos/session-identity.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";

/**
 * Domain Policy: Maps various authentication outputs to a SessionPrincipalDto.
 *
 * This centralizes the reconstruction of the identity principal from:
 * 1. Decoded session claims (requires decoding the userId string)
 * 2. Use case output DTOs (simple mapping)
 */
export function toSessionPrincipalPolicy(
  source: SessionTokenClaims | AuthenticatedUserDto | UpdateSessionSuccessDto,
): SessionIdentityDto {
  if ("email" in source) {
    // Mapping from AuthUserOutputDto
    return {
      id: source.id,
      role: source.role,
    };
  }

  // Handles both SessionTokenClaims and UpdateSessionSuccess
  return {
    id:
      typeof source.userId === "string"
        ? userIdCodec.decode(source.userId)
        : source.userId,
    role: source.role,
  };
}
