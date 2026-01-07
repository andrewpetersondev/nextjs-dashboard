import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { IssueTokenInput } from "@/modules/auth/application/dtos/issue-token.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

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

export type UpdateSessionNotRotated = {
  readonly ageMs?: number;
  readonly maxMs?: number;
  readonly reason: UpdateSessionFailureReason;
  readonly refreshed: false;
  readonly timeLeftMs?: number;
};

export type UpdateSessionSuccess = {
  readonly expiresAt: number;
  readonly reason: "rotated";
  readonly refreshed: true;
  readonly role: UserRole;
  readonly userId: UserId;
};

/**
 * Policy/outcome union for session refresh.
 *
 * - `refreshed: false` cases are expected outcomes (no cookie, not needed, policy exceeded, invalid user)
 * - operational failures are represented as `Err(AppError)` at the service boundary
 */
export type UpdateSessionOutcome =
  | UpdateSessionNotRotated
  | UpdateSessionSuccess;

/** Compute absolute lifetime status from immutable sessionStart. */
export function absoluteLifetime(user?: {
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
export function timeLeftMs(payload?: {
  exp?: number;
  expiresAt?: number;
}): number {
  if (payload?.expiresAt && Number.isFinite(payload.expiresAt)) {
    return payload.expiresAt - Date.now();
  }
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}

export function shouldRefreshToken(decoded: {
  exp?: number;
  expiresAt?: number;
}): {
  refresh: boolean;
  timeLeftMs: number;
} {
  const remaining = timeLeftMs({
    exp: decoded.exp,
    expiresAt: decoded.expiresAt,
  });
  return {
    refresh: remaining <= SESSION_REFRESH_THRESHOLD_MS,
    timeLeftMs: remaining,
  };
}

export function makeSessionClaims(
  input: IssueTokenInput & { expiresAtMs: number; iatMs: number },
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
export function toSessionPrincipal(
  source: SessionTokenClaims | AuthUserOutputDto,
): SessionPrincipalDto {
  if ("email" in source) {
    // Mapping from AuthUserOutputDto
    return {
      id: source.id,
      role: source.role,
    };
  }

  // Mapping from SessionTokenClaims
  return {
    id: userIdCodec.decode(source.userId),
    role: source.role,
  };
}
