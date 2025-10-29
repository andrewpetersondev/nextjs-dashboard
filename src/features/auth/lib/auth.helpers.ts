import {
  AUTH_ENDPOINTS,
  type OauthProvider,
} from "@/features/auth/lib/auth.constants";

/**
 * Returns the API endpoint for a given OAuth provider.
 */
export function getAuthEndpoint(provider: OauthProvider): `/${string}` {
  return AUTH_ENDPOINTS[provider];
}

/**
 * Builds an OAuth URL with an optional redirect parameter.
 * Keeps logic in one place to avoid ad-hoc query handling across the app.
 */
export function buildAuthUrl(
  provider: OauthProvider,
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
