/**
 * Domain Policy: Reasons for authorizing or redirecting an authentication request.
 */
export const AUTH_REQUEST_REASONS = {
  ADMIN_NOT_AUTHENTICATED: "admin.not_authenticated",
  ADMIN_NOT_AUTHORIZED: "admin.not_authorized",
  DECODE_FAILED: "decode_failed",
  NO_COOKIE: "no_cookie",
  PROTECTED_NOT_AUTHENTICATED: "protected.not_authenticated",
  PUBLIC_BOUNCE_AUTHENTICATED: "public.bounce_authenticated",
  ROUTE_FLAGS_INVALID: "route_flags_invalid",
} as const;

/**
 * Domain Policy: Reasons for authorizing or redirecting an authentication request.
 * Covers authentication failures, authorization denials, and session-related issues.
 */
export type AuthRequestReason =
  (typeof AUTH_REQUEST_REASONS)[keyof typeof AUTH_REQUEST_REASONS];

/**
 * Domain Policy: Results of decoding/reading a session token from the request.
 *
 * @remarks
 * This is intentionally not an `AuthPolicyReason`:
 * policy reasons describe authorization decisions, while decode results describe token extraction/decoding.
 */
export const AUTH_SESSION_DECODE_RESULTS = {
  DECODE_FAILED: "decode_failed",
  INVALID_CLAIMS: "invalid_claims",
  NO_COOKIE: "no_cookie",
  OK: "ok",
} as const;

export type AuthSessionDecodeResult =
  (typeof AUTH_SESSION_DECODE_RESULTS)[keyof typeof AUTH_SESSION_DECODE_RESULTS];
