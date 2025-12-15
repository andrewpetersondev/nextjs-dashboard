import "server-only";

export const SESSION_COOKIE_NAME = "session" as const;

export const SESSION_DURATION_MS = 900_000 as const;

export const SESSION_REFRESH_THRESHOLD_MS = 120_000 as const;
