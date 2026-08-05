/**
 * Security response headers.
 *
 * @remarks
 * Split across two delivery mechanisms, deliberately:
 *
 * - {@link STATIC_SECURITY_HEADERS} are request-independent, so they ship from
 *   `next.config.ts`'s `headers()` and cover **every** response including static
 *   assets, which the proxy matcher skips.
 * - The Content-Security-Policy is per-request (it carries a fresh nonce), so it
 *   can only be built in `src/proxy.ts`. See {@link buildContentSecurityPolicy}.
 *
 * This module is imported by `next.config.ts`, which is evaluated outside the
 * app's module graph — keep it dependency-free (no `server-only`, no `@/` imports).
 */

/** Two years — the max-age HSTS preload lists require. */
const HSTS_MAX_AGE_SEC = 63_072_000;

/** 16 bytes -> 24 base64 characters. */
const NONCE_BYTE_LENGTH = 16;

/**
 * Headers that never vary by request.
 *
 * @remarks
 * `X-Frame-Options` duplicates the CSP's `frame-ancestors` on purpose, and the
 * reason is stronger than legacy-browser coverage: the CSP is built per-request
 * in `src/proxy.ts`, so any response the proxy matcher skips (`/api/*`,
 * `/_next/static/*`, `/favicon.ico`) carries no `frame-ancestors` at all. This
 * header ships from `next.config.ts` on every path.
 *
 * `Strict-Transport-Security` is inert over plain HTTP, so it is safe to send in
 * local development too. It is also inert on the current host: the whole `.app`
 * gTLD is HSTS-preloaded, and Vercel already sends a stronger header of its own.
 * It is here for a future custom domain — which is exactly where `includeSubDomains`
 * needs care, because it commits every client that loads one page to HTTPS-only
 * for EVERY subdomain of that apex for two years, and that cannot be revoked
 * faster than the max-age expires. BEFORE moving to a custom domain: confirm
 * every subdomain of the apex serves HTTPS, or drop `includeSubDomains` until
 * they do. `preload` stays omitted — submitting a domain we don't control would
 * be inappropriate.
 */
export const STATIC_SECURITY_HEADERS: readonly Readonly<{
	key: string;
	value: string;
}>[] = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), payment=()",
	},
	{
		key: "Strict-Transport-Security",
		value: `max-age=${HSTS_MAX_AGE_SEC}; includeSubDomains`,
	},
] as const;

/** Header name for the per-request CSP. */
export const HEADER_CONTENT_SECURITY_POLICY =
	"Content-Security-Policy" as const;

/**
 * Request header carrying the nonce to the renderer.
 *
 * @remarks
 * Next.js reads the nonce out of the CSP on the **request** headers and stamps it
 * onto its own bootstrap `<script>` tags. This separate header exists so app code
 * can read the raw value via `headers()` without re-parsing the policy.
 */
export const HEADER_NONCE = "x-nonce" as const;

/**
 * Generates a fresh CSP nonce.
 *
 * @remarks
 * Must be unpredictable and unique per response — a reused nonce is equivalent to
 * `'unsafe-inline'` for anyone who can observe one page.
 *
 * Encoding the random bytes directly rather than base64-ing a UUID string is a
 * SIZE choice, not a security one: `btoa(crypto.randomUUID())` was already 122
 * unguessable bits, it just spent 48 header characters to carry them. The output
 * must satisfy Next's `/^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/` — standard base64
 * (`+`, `/`, `=`) does; a malformed value is dropped SILENTLY, so
 * `security-headers.test.ts` pins the shape.
 */
export function generateCspNonce(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(NONCE_BYTE_LENGTH));
	return btoa(String.fromCharCode(...bytes));
}

/**
 * Builds the Content-Security-Policy for one request.
 *
 * @param nonce - Per-request nonce from {@link generateCspNonce}.
 * @param isDev - Whether the dev server is running. Development needs a looser
 *   policy: React Fast Refresh evaluates code with `eval`, and Next injects
 *   stylesheets through inline `<style>` tags rather than emitting CSS chunks.
 *   Both relaxations are dev-only and never reach production.
 */
export function buildContentSecurityPolicy(
	nonce: string,
	isDev: boolean,
): string {
	const scriptSrc = [
		"'self'",
		`'nonce-${nonce}'`,
		// Trusts scripts loaded *by* an already-trusted script, which is how Next
		// pulls in its chunks. Supporting browsers ignore the 'self' above once
		// this is present; 'self' stays as the fallback for those that don't.
		"'strict-dynamic'",
		// Only 'unsafe-eval' — React Fast Refresh genuinely evaluates code. There
		// is deliberately no 'unsafe-inline' here even in dev: per CSP2+, browsers
		// ignore it whenever a nonce source is present in the same directive, and
		// one always is. Listing it would only misrepresent how lax dev really is.
		...(isDev ? ["'unsafe-eval'"] : []),
	].join(" ");

	const styleSrc = ["'self'", ...(isDev ? ["'unsafe-inline'"] : [])].join(" ");

	const directives = [
		"default-src 'self'",
		`script-src ${scriptSrc}`,
		`style-src ${styleSrc}`,
		// blob: and data: cover next/image's optimizer output and inline SVG icons.
		"img-src 'self' blob: data:",
		"font-src 'self'",
		"connect-src 'self'",
		"object-src 'none'",
		// The app has no <base> element, so 'none' costs nothing and removes a
		// same-origin `<base href>` injection primitive that would silently
		// repoint every relative script URL.
		"base-uri 'none'",
		// Server Actions post back to this origin only.
		"form-action 'self'",
		"frame-ancestors 'none'",
		...(isDev ? [] : ["upgrade-insecure-requests"]),
	];

	return directives.join("; ");
}
