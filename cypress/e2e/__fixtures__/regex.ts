/**
 * Regex used to identify the login form via accessible name.
 */
export const LOGIN_REGEX: RegExp = /login form/i;

/**
 * Common UI text matchers to keep assertions consistent and centralized.
 */
export const UI_MATCHERS = {
  DASHBOARD_H1: /User Dashboard/i,
  LOGIN_HEADING: /Log in to your account/i,
  SIGN_OUT_BUTTON: /Sign Out/i,
  SIGNUP_HEADING: /Sign up for an account/i,
  WELCOME_HOME: /Welcome to Acme\./i,
} as const satisfies Readonly<Record<string, RegExp>>;
