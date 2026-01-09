import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";

export const SESSION_DURATION_MS = 900_000 as const; // 15 minutes
export const SESSION_REFRESH_THRESHOLD_MS = 120_000 as const; // 2 minutes
export const MAX_ABSOLUTE_SESSION_MS = 2_592_000_000 as const; // 30 days
export const ONE_SECOND_MS = 1000 as const;

/**
 * Domain Policy: Recognized reasons for terminating a session.
 */
export type TerminateSessionReason =
  | "absolute_limit_exceeded"
  | "expired"
  | "invalid_token"
  | "user_logout";

/**
 * Domain Policy: Reasons for session lifecycle decisions.
 */
export type SessionLifecycleReason =
  | TerminateSessionReason
  | "approaching_expiry"
  | "valid";

export function makeSessionClaimsPolicy(
  input: IssueTokenRequestDto & { expiresAtMs: number; iatMs: number },
) {
  return {
    exp: Math.floor(input.expiresAtMs / ONE_SECOND_MS),
    expiresAt: input.expiresAtMs,
    iat: Math.floor(input.iatMs / ONE_SECOND_MS),
    role: input.role,
    sessionStart: input.sessionStart,
    userId: input.userId,
  };
}

/**
 * Domain Policy: Maps various authentication outputs to a SessionPrincipalDto.
 *
 * This centralizes the reconstruction of the identity principal from:
 * 1. Decoded session claims (requires decoding the userId string)
 * 2. Use case output DTOs (simple mapping)
 */
export function toSessionPrincipalPolicy(
  source: SessionTokenClaims | AuthenticatedUserDto | UpdateSessionSuccessDto,
): SessionPrincipalDto {
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
