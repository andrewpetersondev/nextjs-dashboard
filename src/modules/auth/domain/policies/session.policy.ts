import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";

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

// todo: this function imports from application layer. i am wondering if my domain layer should have more types
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
