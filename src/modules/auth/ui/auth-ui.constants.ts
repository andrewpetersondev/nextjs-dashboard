export const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh" as const;

export type OauthProvider = "google" | "github";

export const AUTH_ENDPOINTS = {
  github: "/api/auth/github",
  google: "/api/auth/google",
} as const satisfies Record<OauthProvider, `/${string}`>;
