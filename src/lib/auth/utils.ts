import "server-only";

/**
 * Safely retrieves a string cookie value.
 */
export function getCookieValue(cookie: unknown): string | undefined {
	return typeof cookie === "string" ? cookie : undefined;
}
