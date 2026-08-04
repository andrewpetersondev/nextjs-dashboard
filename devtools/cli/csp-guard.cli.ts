import { spawn } from "node:child_process";
import process from "node:process";

/**
 * CSP guard (CI gate).
 *
 * The failure this exists to catch is SILENT. Under
 * `script-src 'self' 'nonce-…' 'strict-dynamic'` a page that ships without a
 * nonce still renders: the markup is there, links work, nothing throws. What is
 * missing is every inline `self.__next_f.push(...)` flight script, so the RSC
 * payload never arrives, React never mounts, no error boundary fires, and no
 * hydration warning is emitted. The page is visually correct and completely
 * inert.
 *
 * At least four independent changes produce that outcome, and only one of them
 * is visible in the build output:
 *
 *   1. a route becomes statically prerendered again (build-time HTML cannot
 *      carry a per-request nonce) — e.g. `export const dynamic` is deleted from
 *      `src/app/layout.tsx`;
 *   2. the proxy matcher stops covering a document path, so the response ships
 *      with no CSP at all;
 *   3. `withCsp()` / the request-header plumbing in `src/proxy.ts` is dropped,
 *      so Next never sees a nonce to stamp;
 *   4. `generateCspNonce()` emits a value Next's extractor rejects. That
 *      extractor is silent by design — see
 *      `next/dist/server/app-render/get-script-nonce-from-header.js`, whose
 *      regex is /^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/ and whose comment says a
 *      malformed nonce is ignored "so the request can continue without a nonce
 *      instead of failing".
 *
 * A filesystem check over `.next/server/app/**\/*.html` sees only (1). So this
 * guard asserts on SERVED RESPONSES from a production server instead: the CSP
 * header is present, it is strict, and every `<script>` in every HTML document
 * carries that exact nonce.
 *
 * Requires a completed `next build`. Spawns `next start` on a spare port,
 * probes, and tears it down. Set `CSP_GUARD_BASE_URL` to probe an
 * already-running server instead (useful against a real deployment).
 */

/** Spare port, deliberately far from 3000/3001 so a running dev server never collides. */
const DEFAULT_GUARD_PORT = 3977;

const PORT = Number(process.env.CSP_GUARD_PORT ?? DEFAULT_GUARD_PORT);
const EXTERNAL_BASE_URL = process.env.CSP_GUARD_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://127.0.0.1:${PORT}`;

const SERVER_READY_TIMEOUT_MS = 60_000;
const SERVER_POLL_INTERVAL_MS = 250;
/** How much of an offending <script> tag to echo in the failure message. */
const TAG_EXCERPT_LENGTH = 120;

/**
 * Paths every one of which must answer with a nonced HTML document.
 *
 * `/nope` and `/nope.js` are not typos. Next answers ANY unmatched path with a
 * full `text/html` 404 document, including paths that look like static assets —
 * so a matcher that excludes by file extension ships live HTML with no CSP.
 * That bug was real here; these two paths are the regression test for it.
 */
const HTML_PATHS = [
	"/",
	"/auth/login",
	"/auth/signup",
	"/auth/forgot-password",
	"/nope",
	"/nope.js",
] as const;

/** Exactly Next's own nonce-extraction regex. A value this rejects is ignored silently. */
const NEXT_NONCE_REGEX = /^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/;
const POLICY_NONCE_REGEX = /'nonce-[^']*'/;
const SCRIPT_TAG_REGEX = /<script\b[^>]*>/g;
const STYLE_ELEMENT_REGEX = /<style\b/g;
const STYLE_ATTRIBUTE_REGEX = /\sstyle="/g;
const FORBIDDEN_SOURCES = ["'unsafe-inline'", "'unsafe-eval'"] as const;
const REQUIRED_DIRECTIVES = [
	"'strict-dynamic'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"base-uri 'none'",
	"form-action 'self'",
] as const;

const failures: string[] = [];

function fail(where: string, message: string): void {
	failures.push(`${where}: ${message}`);
}

/** One reachability probe; resolves false while the server is still booting. */
async function serverIsUp(): Promise<boolean> {
	try {
		await fetch(BASE_URL, { redirect: "manual" });
		return true;
	} catch {
		return false;
	}
}

async function waitForServer(): Promise<void> {
	const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;

	// Polling a boot sequence is inherently sequential — recursion keeps the
	// await out of a loop body without pretending these can run concurrently.
	const attempt = async (): Promise<void> => {
		if (await serverIsUp()) {
			return;
		}
		if (Date.now() >= deadline) {
			throw new Error(`Server did not become ready on ${BASE_URL}`);
		}
		await new Promise((r) => setTimeout(r, SERVER_POLL_INTERVAL_MS));
		return await attempt();
	};

	return await attempt();
}

/** Asserts one HTML document is fully protected AND fully nonced. */
function checkHtmlDocument(path: string, policy: string, body: string): void {
	const nonceToken = POLICY_NONCE_REGEX.exec(policy)?.[0];

	if (!nonceToken) {
		fail(path, "CSP has no nonce source in script-src");
		return;
	}
	if (!NEXT_NONCE_REGEX.test(nonceToken)) {
		fail(
			path,
			`nonce ${nonceToken} is rejected by Next's extractor regex — Next will ignore it silently`,
		);
		return;
	}

	const nonceValue = NEXT_NONCE_REGEX.exec(nonceToken)?.[1] ?? "";
	const scriptTags = body.match(SCRIPT_TAG_REGEX) ?? [];
	const unNonced = scriptTags.filter(
		(tag) => !tag.includes(`nonce="${nonceValue}"`),
	);

	if (scriptTags.length === 0) {
		fail(path, "HTML document contains no <script> tags at all");
	}
	if (unNonced.length > 0) {
		fail(
			path,
			`${unNonced.length}/${scriptTags.length} <script> tags lack nonce="${nonceValue}" — this page will not hydrate. First: ${unNonced[0]?.slice(0, TAG_EXCERPT_LENGTH)}`,
		);
	}
	if (!body.includes("self.__next_f")) {
		fail(path, "no self.__next_f flight payload in the document");
	}

	// style-src is 'self' with no 'unsafe-inline' and carries no nonce, so any
	// inline style — element or attribute — is blocked and renders unstyled.
	const styleElements = (body.match(STYLE_ELEMENT_REGEX) ?? []).length;
	const styleAttributes = (body.match(STYLE_ATTRIBUTE_REGEX) ?? []).length;
	if (styleElements > 0 || styleAttributes > 0) {
		fail(
			path,
			`${styleElements} inline <style> element(s) and ${styleAttributes} inline style="" attribute(s) — blocked by style-src 'self'`,
		);
	}
}

function checkPolicy(path: string, policy: string): void {
	for (const forbidden of FORBIDDEN_SOURCES) {
		if (policy.includes(forbidden)) {
			fail(path, `production CSP contains ${forbidden}`);
		}
	}
	for (const required of REQUIRED_DIRECTIVES) {
		if (!policy.includes(required)) {
			fail(path, `production CSP is missing ${required}`);
		}
	}
}

async function probe(path: string): Promise<string | undefined> {
	const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
	const policy = res.headers.get("content-security-policy");
	const contentType = res.headers.get("content-type") ?? "";

	if (!policy) {
		fail(path, `no Content-Security-Policy header (${contentType || "?"})`);
		return;
	}
	checkPolicy(path, policy);

	if (!contentType.includes("text/html")) {
		fail(path, `expected an HTML document, got ${contentType}`);
		return;
	}

	checkHtmlDocument(path, policy, await res.text());
	return POLICY_NONCE_REGEX.exec(policy)?.[0];
}

async function main(): Promise<void> {
	const server = EXTERNAL_BASE_URL
		? undefined
		: spawn("next", ["start", "-p", String(PORT)], {
				env: process.env,
				stdio: "ignore",
			});

	try {
		await waitForServer();

		const nonces: (string | undefined)[] = [];
		for (const path of HTML_PATHS) {
			// biome-ignore lint/performance/noAwaitInLoops: sequential on purpose — parallel probes make the nonce-reuse check meaningless.
			nonces.push(await probe(path));
		}

		// A nonce reused across responses is equivalent to 'unsafe-inline'.
		const seen = nonces.filter((n): n is string => Boolean(n));
		if (new Set(seen).size !== seen.length) {
			fail("*", "a nonce was reused across responses");
		}
	} finally {
		server?.kill();
	}

	if (failures.length > 0) {
		console.error("CSP guard FAILED:");
		for (const f of failures) {
			console.error(`  ✗ ${f}`);
		}
		console.error(
			"\nA page that fails this check renders but never hydrates — it will look fine in a screenshot.",
		);
		process.exit(1);
	}

	console.log(
		`CSP guard passed: ${HTML_PATHS.length} documents, every <script> nonced, no inline styles, policy strict.`,
	);
}

main().catch((error: unknown) => {
	console.error("CSP guard errored:", error);
	process.exit(1);
});
