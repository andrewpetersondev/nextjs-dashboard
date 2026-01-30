/** Session duration in seconds (15 minutes) */
export const SESSION_DURATION_SEC = 900 as const;
/** Threshold in seconds for triggering session rotation (2 minutes) */
export const SESSION_REFRESH_THRESHOLD_SEC = 120 as const;
/** Maximum absolute session lifetime in seconds (30 days) */
export const MAX_ABSOLUTE_SESSION_SEC = 2_592_000 as const;

export const SESSION_LIFECYCLE_ACTIONS = {
  CONTINUE: "continue",
  ROTATE: "rotate",
  TERMINATE: "terminate",
} as const;

/**
 * Architectural actions to take based on session state evaluation.
 */
export type SessionLifecycleAction =
  (typeof SESSION_LIFECYCLE_ACTIONS)[keyof typeof SESSION_LIFECYCLE_ACTIONS];

export const SESSION_LIFECYCLE_REASONS = {
  ABSOLUTE_LIMIT_EXCEEDED: "absolute_limit_exceeded",
  APPROACHING_EXPIRY: "approaching_expiry",
  EXPIRED: "expired",
  LOGOUT: "logout",
  VALID: "valid",
} as const;
/**
 * Domain Policy: Reasons for session lifecycle actions.
 */
export type SessionLifecycleReason =
  (typeof SESSION_LIFECYCLE_REASONS)[keyof typeof SESSION_LIFECYCLE_REASONS];
