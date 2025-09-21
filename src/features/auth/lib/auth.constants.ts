import { ROUTES } from "@/shared/routes/routes";

// Auth Form Fields
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MIN_LENGTH_ERROR =
  "Username must be at least 3 characters long.";

export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_MAX_LENGTH_ERROR =
  "Username must be at most 20 characters long.";

export const PASSWORD_MIN_LENGTH = 5;
export const PASSWORD_MIN_LENGTH_ERROR =
  "Password must be at least 5 characters long.";

export const PASSWORD_MAX_LENGTH = 20;
export const PASSWORD_MAX_LENGTH_ERROR =
  "Password must be at most 20 characters long.";

export const PASSWORD_RULE_REGEX_CONTAIN_LETTER = /[a-zA-Z]/;
export const PASSWORD_RULE_REGEX_ERROR_LETTER =
  "Password must contain at least one letter.";

export const PASSWORD_RULE_REGEX_CONTAIN_NUMBER = /[0-9]/;
export const PASSWORD_RULE_REGEX_ERROR_NUMBER =
  "Password must contain at least one number.";

export const PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER =
  /[!@#$%^&*(),.?":{}|<>]/;
export const PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER =
  "Password must contain at least one special character.";

export const EMAIL_ERROR = "Email had some sort of error. Please try again.";

export const LOGIN_PATH = ROUTES.AUTH.LOGIN;

// API Endpoints

export const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh" as const;

// OAuth provider identifiers
export type OAuthProvider = "google" | "github";

// OAuth endpoints by provider
export const AUTH_ENDPOINTS = {
  github: "/api/auth/github",
  google: "/api/auth/google",
} as const satisfies Record<OAuthProvider, `/${string}`>;

// Backwards-compatible named constants (preserved)
export const AUTH_GOOGLE_ENDPOINT = AUTH_ENDPOINTS.google;
export const AUTH_GITHUB_ENDPOINT = AUTH_ENDPOINTS.github;

// Optional UI strings (central place for simple, shared copy)
export const AUTH_UI = {
  buttons: {
    signInWithGitHub: "Sign in with GitHub",
    signInWithGoogle: "Sign in with Google",
  },
  messages: {
    orContinueWith: "Or continue with",
  },
} as const;

// Headings
export const SIGNUP_HEADING = "Sign up for an account" as const;
export const LOGIN_HEADING = "Log in to your account" as const;
// UI labels
export const AUTH_DIVIDER_LABEL = "or continue with" as const;
export const DEMO_USER_LABEL = "demo-user" as const;
export const DEMO_ADMIN_LABEL = "demo-admin-user" as const;
