// One second in milliseconds.
const ONE_SECOND_MS = 1000 as const;

/**
 * Client refresher cadence (UI-only).
 * Server owns: session duration, refresh threshold, absolute lifetime, JWT params.
 * Do NOT duplicate server values here.
 */
export const SESSION_REFRESH_PING_MS = 60 * ONE_SECOND_MS; // e.g. once per minute
export const SESSION_KICKOFF_TIMEOUT_MS = 1500;
export const SESSION_REFRESH_JITTER_MS = 1000;
