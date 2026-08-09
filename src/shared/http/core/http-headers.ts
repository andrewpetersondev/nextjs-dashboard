// Common HTTP header names
export const HEADER_CACHE_CONTROL = "Cache-Control" as const;
export const HEADER_PRAGMA = "Pragma" as const;
export const HEADER_EXPIRES = "Expires" as const;
export const HEADER_VARY = "Vary" as const;
export const HEADER_CONTENT_TYPE = "content-type" as const;

/**
 * Directives that stop a response being stored anywhere.
 *
 * Set together with {@link PRAGMA_NO_CACHE} and {@link EXPIRES_IMMEDIATELY}:
 * modern caches honour this header alone, and the other two exist for
 * intermediaries that predate it.
 */
export const CACHE_CONTROL_NO_STORE =
	"no-store, no-cache, must-revalidate" as const;

/** HTTP/1.0 counterpart to {@link CACHE_CONTROL_NO_STORE}. */
export const PRAGMA_NO_CACHE = "no-cache" as const;

/** An always-past expiry date, per HTTP/1.0 — `0` is the conventional spelling. */
export const EXPIRES_IMMEDIATELY = "0" as const;

/**
 * Marks a response as varying by `Cookie`.
 *
 * Required on anything session-dependent: without it a shared cache may serve
 * one user's response to another.
 */
export const VARY_COOKIE = "Cookie" as const;

export const CONTENT_TYPE_JSON = "application/json" as const;

/** Success with a deliberately empty body — the session-refresh route's reply. */
export const HTTP_STATUS_NO_CONTENT = 204;
