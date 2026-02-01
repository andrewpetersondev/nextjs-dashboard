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

export const AUTH_POLICY_NAMES = {
  REGISTRATION: "registration",
  SESSION_VERIFICATION: "session-verification",
} as const;

export type AuthPolicyName =
  (typeof AUTH_POLICY_NAMES)[keyof typeof AUTH_POLICY_NAMES];
