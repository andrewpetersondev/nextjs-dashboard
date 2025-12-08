import { ROUTES } from "@/shared/routes/routes";

export const LOGIN_PATH = ROUTES.auth.login;

export const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh" as const;

export type OauthProvider = "google" | "github";

export const AUTH_ENDPOINTS = {
  github: "/api/auth/github",
  google: "/api/auth/google",
} as const satisfies Record<OauthProvider, `/${string}`>;

export const SIGNUP_HEADING = "Sign up for an account" as const;
export const LOGIN_HEADING = "Log in to your account" as const;

export const AUTH_DIVIDER_LABEL = "or continue with" as const;
export const DEMO_USER_LABEL = "demo-user" as const;
export const DEMO_ADMIN_LABEL = "demo-admin-user" as const;
