/** Session duration in seconds (15 minutes) */
export const SESSION_DURATION_SEC = 900 as const;

/** Threshold in seconds for triggering session rotation (2 minutes) */
export const SESSION_REFRESH_THRESHOLD_SEC = 120 as const;

/** Maximum absolute session lifetime in seconds (30 days) */
export const MAX_ABSOLUTE_SESSION_SEC = 2_592_000 as const;
