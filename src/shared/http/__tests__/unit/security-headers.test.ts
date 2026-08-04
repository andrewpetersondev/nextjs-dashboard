import { describe, expect, it } from "vitest";
import {
	buildContentSecurityPolicy,
	generateCspNonce,
} from "@/shared/http/server/security-headers";

/**
 * Unit tests for the CSP builder (security-headers.ts).
 *
 * These pin the half of the invariant that is a pure function: the production
 * policy is strict, and the nonce is in a shape Next will actually accept. The
 * other half — that no served document is missing the nonce — cannot be proven
 * here and is covered by `devtools/cli/csp-guard.cli.ts` against a real build.
 */
describe("buildContentSecurityPolicy", () => {
	const NONCE = "dGVzdC1ub25jZS12YWx1ZQ==";

	describe("production", () => {
		const policy = buildContentSecurityPolicy(NONCE, false);

		it("carries the nonce and 'strict-dynamic'", () => {
			expect(policy).toContain(`'nonce-${NONCE}'`);
			expect(policy).toContain("'strict-dynamic'");
		});

		it("never relaxes script execution", () => {
			expect(policy).not.toContain("'unsafe-inline'");
			expect(policy).not.toContain("'unsafe-eval'");
		});

		it("locks the non-script directives", () => {
			expect(policy).toContain("object-src 'none'");
			expect(policy).toContain("base-uri 'none'");
			expect(policy).toContain("frame-ancestors 'none'");
			expect(policy).toContain("form-action 'self'");
			expect(policy).toContain("upgrade-insecure-requests");
		});
	});

	describe("development", () => {
		const policy = buildContentSecurityPolicy(NONCE, true);

		it("allows eval for Fast Refresh but not inline script", () => {
			expect(policy).toContain("'unsafe-eval'");
			expect(policy).toContain(`script-src 'self' 'nonce-${NONCE}'`);
			// 'unsafe-inline' must appear for style-src ONLY. In script-src it is a
			// dead token anyway (a nonce source makes browsers ignore it), so listing
			// it there would only misrepresent how lax dev is.
			expect(policy).toContain("style-src 'self' 'unsafe-inline'");
			expect(policy.split("style-src")[0]).not.toContain("'unsafe-inline'");
		});
	});
});

describe("generateCspNonce", () => {
	/**
	 * Next's own extractor, verbatim from
	 * `next/dist/server/app-render/get-script-nonce-from-header.js`. A nonce this
	 * rejects is ignored SILENTLY — Next renders the page with no nonce at all
	 * rather than failing — so this assertion is load-bearing.
	 */
	const NEXT_NONCE_REGEX = /^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/;

	it("produces a value Next's nonce extractor accepts", () => {
		for (let i = 0; i < 100; i++) {
			expect(`'nonce-${generateCspNonce()}'`).toMatch(NEXT_NONCE_REGEX);
		}
	});

	it("never repeats", () => {
		const nonces = new Set(
			Array.from({ length: 1000 }, () => generateCspNonce()),
		);
		expect(nonces.size).toBe(1000);
	});
});
