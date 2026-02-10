/**
 * Endpoint for refreshing the authentication session via API.
 */
export const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh" as const;

/**
 * Supported OAuth identity providers.
 */
export type OauthProvider = "google" | "github";

/**
 * Mapping of OAuth providers to their respective authentication initiation endpoints.
 */
// biome-ignore lint/nursery/useExplicitType: fix later
export const AUTH_ENDPOINTS = {
  /** GitHub OAuth initiation endpoint. */
  github: "/api/auth/github",
  /** Google OAuth initiation endpoint. */
  google: "/api/auth/google",
} as const satisfies Record<OauthProvider, `/${string}`>;
