/**
 * Domain Policy: Reasons for authorizing or redirecting an authentication request.
 * Covers authentication failures, authorization denials, and session-related issues.
 */
export type AuthRequestAuthorizationReason =
  | "admin.not_authenticated"
  | "admin.not_authorized"
  | "decode_failed"
  | "no_cookie"
  | "protected.not_authenticated"
  | "public.bounce_authenticated";
