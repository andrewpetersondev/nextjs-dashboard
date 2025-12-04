/** biome-ignore-all lint/style/noMagicNumbers: <magic numbers are inevitable> */

// Base units (server-owned to avoid circular dependency on features)
export const ONE_SECOND_MS = 1000 as const;
export const SECONDS_PER_MINUTE = 60 as const;
export const ONE_MINUTE_MS = SECONDS_PER_MINUTE * ONE_SECOND_MS;

/**
 * Client refresher cadence (UI-only).
 * Server owns: session duration, refresh threshold, absolute lifetime, JWT params.
 * Do NOT duplicate server values here.
 */
export const SESSION_REFRESH_PING_MS = 60 * ONE_SECOND_MS; // e.g. once per minute
export const SESSION_KICKOFF_TIMEOUT_MS = 1500;
export const SESSION_REFRESH_JITTER_MS = 1000;
// encryption
export const SALT_ROUNDS = 10 as const;
// cookie (server is the source of truth)
export const SESSION_COOKIE_NAME = "session" as const;
export const SESSION_COOKIE_PATH = "/" as const;
export const SESSION_COOKIE_SAMESITE = "lax" as const;
export const SESSION_COOKIE_HTTPONLY = true as const;
// In production, `secure` is decided in session.ts via env; this is a non-prod fallback only.
export const SESSION_COOKIE_SECURE_FALLBACK = false as const;
// Session timing (canonical)
export const SESSION_DURATION_MS = 15 * ONE_MINUTE_MS; // 15 minutes
export const SESSION_REFRESH_THRESHOLD_MS = 2 * ONE_MINUTE_MS; // 2 minutes
// JWT specifics
export const MIN_HS256_KEY_LENGTH = 32 as const;
export const CLOCK_TOLERANCE_SEC = 5 as const;
export const JWT_ALG_HS256 = "HS256" as const;
export const JWT_TYP_JWT = "JWT" as const;
// Absolute lifetime (30 days)
export const MAX_ABSOLUTE_SESSION_MS = ONE_MINUTE_MS * 60 * 24 * 30;
// Rolling cookie maxAge in seconds
export const ROLLING_COOKIE_MAX_AGE_S = Math.floor(
  SESSION_DURATION_MS / ONE_SECOND_MS,
);
