/**
 * JWT configuration constants.
 */
export const JWT_ALG_HS256 = "HS256" as const;

/**
 * Standard JWT type.
 */
export const JWT_TYP_JWT = "JWT" as const;

/**
 * Minimum key length for HS256 algorithm in bytes.
 */
export const MIN_HS256_KEY_LENGTH = 32 as const;

/**
 * Session JWT issuer (`iss` claim) — identifies this application as the token issuer.
 *
 * Hardcoded rather than env-configured: this is stable app identity, not deployment
 * config or a secret (unlike `SESSION_SECRET`). It is the same in every environment,
 * and changing it invalidates all live sessions — so it should change deliberately in
 * code, never silently per environment.
 */
export const SESSION_ISSUER = "my-app" as const;

/**
 * Session JWT audience (`aud` claim) — identifies the intended token consumer (the web client).
 *
 * Hardcoded for the same reasons as {@link SESSION_ISSUER}. When a second consumer is
 * added (e.g. a mobile or API client), widen this to a typed set here in code rather
 * than reaching for an env var — a single env string cannot express multiple audiences.
 */
export const SESSION_AUDIENCE = "web" as const;
