export const SESSION_DURATION_SEC = 900 as const; // 15 minutes
export const SESSION_REFRESH_THRESHOLD_SEC = 120 as const; // 2 minutes
export const MAX_ABSOLUTE_SESSION_SEC = 2_592_000 as const; // 30 days

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
