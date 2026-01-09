import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-success.dto";
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
 * Session policy outcome types.
 *
 * Policy boundary: these represent expected decisions/outcomes, not errors.
 */
export type UpdateSessionFailureReason =
  | "absolute_lifetime_exceeded"
  | "invalid_or_missing_user"
  | "no_cookie"
  | "not_needed";

/** Compute absolute lifetime status from immutable sessionStart. */
export function absoluteLifetimePolicy(user?: {
  sessionStart?: number;
  userId?: string;
}): {
  age: number;
  exceeded: boolean;
} {
  const start = user?.sessionStart ?? 0;
  const age = Date.now() - start;
  return { age, exceeded: !start || age > MAX_ABSOLUTE_SESSION_MS };
}

/**
 * Milliseconds remaining until token expiry (negative if expired).
 *
 * Prefers `expiresAt` (ms) when present; falls back to `exp` (seconds).
 */
export function timeLeftMsPolicy(payload?: {
  exp?: number;
  expiresAt?: number;
}): number {
  if (payload?.expiresAt && Number.isFinite(payload.expiresAt)) {
    return payload.expiresAt - Date.now();
  }
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}

export function shouldRefreshTokenPolicy(decoded: {
  exp?: number;
  expiresAt?: number;
}): {
  refresh: boolean;
  timeLeftMs: number;
} {
  const remaining = timeLeftMsPolicy({
    exp: decoded.exp,
    expiresAt: decoded.expiresAt,
  });
  return {
    refresh: remaining <= SESSION_REFRESH_THRESHOLD_MS,
    timeLeftMs: remaining,
  };
}

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
