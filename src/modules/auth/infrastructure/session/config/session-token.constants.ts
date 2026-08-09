/**
 * Seconds of clock skew tolerated when validating a session token's timestamps.
 *
 * Without it, a server clock a second or two ahead of the issuer would reject
 * tokens that are legitimately valid. Kept small deliberately: every second here
 * is a second a genuinely expired token stays accepted.
 */
export const SESSION_TOKEN_CLOCK_TOLERANCE_SEC = 5 as const;
