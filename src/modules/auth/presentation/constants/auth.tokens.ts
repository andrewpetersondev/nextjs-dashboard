/**
 * UI labels and headings for the authentication module.
 */

/** Heading for the signup page. */
export const SIGNUP_HEADING = "Sign up for an account" as const;

/** Heading for the login page. */
export const LOGIN_HEADING = "Log in to your account" as const;

/** Label for the divider between the credentials form and the demo-account buttons. */
export const AUTH_DIVIDER_LABEL = "or use a demo account" as const;

/** Heading for the forgot-password page. */
export const FORGOT_PASSWORD_HEADING = "Forgot your password?" as const;

/**
 * Generic confirmation shown after a password-reset request.
 *
 * Identical for existing and unknown accounts (ADR 006 — prevent
 * credential enumeration).
 */
export const FORGOT_PASSWORD_CONFIRMATION =
	"If an account exists for that email, we've sent a password reset link." as const;

/** Honest demo caption: this portfolio app does not send real emails. */
export const FORGOT_PASSWORD_DEMO_NOTE =
	"Demo project: no reset email is actually sent." as const;

/** Label for the demo user role in the UI. */
export const DEMO_USER_LABEL = "demo-user" as const;

/** Label for the demo admin role in the UI. */
export const DEMO_ADMIN_LABEL = "demo-admin-user" as const;
