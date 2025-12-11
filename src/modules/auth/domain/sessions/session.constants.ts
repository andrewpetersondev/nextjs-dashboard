export const SESSION_COOKIE_NAME = "session" as const;

export const ONE_SECOND_MS = 1000 as const;

// 15 minutes in milliseconds
export const SESSION_DURATION_MS = 900_000 as const;

// 2 minutes in milliseconds
export const SESSION_REFRESH_THRESHOLD_MS = 120_000 as const;

// 30 days in milliseconds
export const MAX_ABSOLUTE_SESSION_MS = 2_592_000_000 as const;
