// Centralized constants and helpers for Auth UI copy and endpoints.
// Keep dependency-free and safe for both client and server contexts.

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

// Helpers

/**
 * Returns the API endpoint for a given OAuth provider.
 */
export function getAuthEndpoint(provider: OAuthProvider): `/${string}` {
  return AUTH_ENDPOINTS[provider];
}

/**
 * Builds an OAuth URL with an optional redirect parameter.
 * Keeps logic in one place to avoid ad-hoc query handling across the app.
 */
export function buildAuthUrl(
  provider: OAuthProvider,
  options?: { redirectTo?: string },
): string {
  const base = getAuthEndpoint(provider);
  if (!options?.redirectTo) {
    return base;
  }

  const url = new URL(base, "http://localhost"); // base needed for URL API
  url.searchParams.set("redirectTo", options.redirectTo);
  // Remove the origin before returning (we only want the path + query)
  return `${url.pathname}${url.search}`;
}
