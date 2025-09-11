// One second in milliseconds.
export const ONE_SECOND_MS = 1000 as const;

// Time unit helpers (avoid magic numbers)
export const SECONDS_PER_MINUTE = 60 as const;
export const MINUTES_PER_HOUR = 60 as const;
export const HOURS_PER_DAY = 24 as const;

export const ONE_MINUTE_MS = SECONDS_PER_MINUTE * ONE_SECOND_MS;
export const ONE_HOUR_MS = MINUTES_PER_HOUR * ONE_MINUTE_MS;
export const ONE_DAY_MS = HOURS_PER_DAY * ONE_HOUR_MS;

// Session duration in milliseconds (1 hour).
export const SESSION_DURATION_MS = ONE_HOUR_MS;

// Re-issue token only if time-to-expiration is at or below this threshold (5 minutes)
export const FIVE_MINUTES = 5 as const;
export const FIVE_MINUTES_MS = FIVE_MINUTES * ONE_MINUTE_MS;
export const SESSION_REFRESH_THRESHOLD_MS = FIVE_MINUTES_MS;

// Minimum length of a HS256 key.
export const MIN_HS256_KEY_LENGTH = 32 as const;
export const CLOCK_TOLERANCE_SEC = 5 as const;

// 30 days.
export const THIRTY_DAYS = 30 as const;
// 30 days in milliseconds.
export const THIRTY_DAYS_MS = THIRTY_DAYS * ONE_DAY_MS;
