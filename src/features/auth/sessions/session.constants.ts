// One second in milliseconds.
export const ONE_SECOND_MS = 1000 as const;

// Time unit helpers (avoid magic numbers)
export const SECONDS_PER_MINUTE = 60 as const;
export const MINUTES_PER_HOUR = 60 as const;
export const HOURS_PER_DAY = 24 as const;

export const ONE_MINUTE_MS = SECONDS_PER_MINUTE * ONE_SECOND_MS;
export const ONE_HOUR_MS = MINUTES_PER_HOUR * ONE_MINUTE_MS;
export const ONE_DAY_MS = HOURS_PER_DAY * ONE_HOUR_MS;

// Session duration tuned for ~20s rolling refresh cadence.
// We set duration to 25s and refresh when <= 5s remain; the refresher pings every ~20s.
// biome-ignore lint/style/noMagicNumbers: <fix later>
export const SESSION_DURATION_MS = 25 * ONE_SECOND_MS;

// Re-issue token only if time-to-expiration is at or below this threshold (5 seconds)
export const FIVE_MINUTES = 5 as const;
export const FIVE_MINUTES_MS = FIVE_MINUTES * ONE_MINUTE_MS;
// For 20s cadence, lower the refresh threshold to 5 seconds.
export const SESSION_REFRESH_THRESHOLD_MS = FIVE_MINUTES_MS;

// Minimum length of a HS256 key.
export const MIN_HS256_KEY_LENGTH = 32 as const;
export const CLOCK_TOLERANCE_SEC = 5 as const;

// 30 days.
export const THIRTY_DAYS = 30 as const;
// 30 days in milliseconds.
export const THIRTY_DAYS_MS = THIRTY_DAYS * ONE_DAY_MS;

// Client refresher cadence and timing controls (centralized here for easy tuning)
// biome-ignore lint/style/noMagicNumbers: <fix later>
export const SESSION_REFRESH_PING_MS = 20 * ONE_SECOND_MS; // base interval for client pings
export const SESSION_KICKOFF_TIMEOUT_MS = 1500; // initial delay before first ping
export const SESSION_REFRESH_JITTER_MS = 1000; // random jitter to avoid lockstep across tabs

// JWT specifics (centralized to avoid magic strings)
export const JWT_ALG_HS256 = "HS256" as const;
export const JWT_TYP_JWT = "JWT" as const;

// Absolute max lifetime for a session regardless of rolling refreshes (default: 30 days)
export const MAX_ABSOLUTE_SESSION_MS = THIRTY_DAYS_MS;

// Rolling cookie maxAge in seconds, derived from session duration.
// Many frameworks expect cookie maxAge in seconds.
export const ROLLING_COOKIE_MAX_AGE_S = Math.floor(
  SESSION_DURATION_MS / ONE_SECOND_MS,
);
