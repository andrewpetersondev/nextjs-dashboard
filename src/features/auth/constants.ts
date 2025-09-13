// Centralized constants for the Auth feature
// Keep UI copy and endpoints here to avoid scattering magic strings.

// Headings
export const SIGNUP_HEADING = "Sign up for an account" as const;
export const LOGIN_HEADING = "Log in to your account" as const;

// UI labels
export const AUTH_DIVIDER_LABEL = "or continue with" as const;
export const DEMO_USER_LABEL = "demo-user" as const;
export const DEMO_ADMIN_LABEL = "demo-admin-user" as const;

// OAuth endpoints
export const AUTH_GOOGLE_ENDPOINT = "/api/auth/google" as const;
export const AUTH_GITHUB_ENDPOINT = "/api/auth/github" as const;
