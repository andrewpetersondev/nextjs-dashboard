/**
 * Domain-level constants for authentication and authorization policies.
 * These constants prevent "magic strings" and ensure consistency across the domain layer.
 */

export const AUTH_ROUTE_TYPES = {
  ADMIN: "admin",
  PROTECTED: "protected",
  PUBLIC: "public",
} as const;

/**
 * Supported route categories for authentication and authorization.
 */
export type AuthRouteType =
  (typeof AUTH_ROUTE_TYPES)[keyof typeof AUTH_ROUTE_TYPES];

export const AUTH_POLICY_REASONS = {
  NO_TOKEN: "no_token",
  NOT_AUTHENTICATED: "not_authenticated",
  NOT_AUTHORIZED: "not_authorized",
} as const;

/**
 * Supported reasons for policy enforcement.
 */
export type AuthPolicyReason =
  (typeof AUTH_POLICY_REASONS)[keyof typeof AUTH_POLICY_REASONS];

export const SESSION_LIFECYCLE_ACTIONS = {
  CONTINUE: "continue",
  ROTATE: "rotate",
  TERMINATE: "terminate",
} as const;

/**
 * Architectural actions to take based on session state evaluation.
 */
export type SessionLifecycleAction =
  (typeof SESSION_LIFECYCLE_ACTIONS)[keyof typeof SESSION_LIFECYCLE_ACTIONS];

export const SESSION_LIFECYCLE_REASONS = {
  ABSOLUTE_LIMIT_EXCEEDED: "absolute_limit_exceeded",
  APPROACHING_EXPIRY: "approaching_expiry",
  EXPIRED: "expired",
  LOGOUT: "logout",
  VALID: "valid",
} as const;

/**
 * Domain Policy: Reasons for session lifecycle actions.
 */
export type SessionLifecycleReason =
  (typeof SESSION_LIFECYCLE_REASONS)[keyof typeof SESSION_LIFECYCLE_REASONS];

/**
 * Domain Policy: Results of decoding/reading a session token from the request.
 *
 * @remarks
 * This is intentionally not an `AuthPolicyReason`:
 * policy reasons describe authorization decisions, while decode results describe token extraction/decoding.
 */
export const AUTH_SESSION_DECODE_RESULTS = {
  DECODE_FAILED: "decode_failed",
  NO_COOKIE: "no_cookie",
  OK: "ok",
} as const;

export type AuthSessionDecodeResult =
  (typeof AUTH_SESSION_DECODE_RESULTS)[keyof typeof AUTH_SESSION_DECODE_RESULTS];

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
} as const;

/**
 * Domain Policy: Reasons for authorizing or redirecting an authentication request.
 * Covers authentication failures, authorization denials, and session-related issues.
 */
export type AuthRequestReason =
  (typeof AUTH_REQUEST_REASONS)[keyof typeof AUTH_REQUEST_REASONS];

export const AUTH_POLICY_NAMES = {
  REGISTRATION: "registration",
  SESSION_VERIFICATION: "session-verification",
} as const;

export type AuthPolicyName =
  (typeof AUTH_POLICY_NAMES)[keyof typeof AUTH_POLICY_NAMES];

export const DEMO_IDENTITY_CONFIG = {
  EMAIL_DOMAIN: "demo.com",
  USERNAME_PREFIX: "Demo",
} as const;
