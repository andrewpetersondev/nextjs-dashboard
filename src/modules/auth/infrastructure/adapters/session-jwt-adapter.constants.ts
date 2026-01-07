/**
 * JWT configuration constants.
 *
 * Used by SessionJwtAdapter for encoding/decoding session tokens.
 */
export const JWT_ALG_HS256 = "HS256" as const;
export const JWT_TYP_JWT = "JWT" as const;
export const MIN_HS256_KEY_LENGTH = 32 as const;
export const CLOCK_TOLERANCE_SEC = 5 as const;
