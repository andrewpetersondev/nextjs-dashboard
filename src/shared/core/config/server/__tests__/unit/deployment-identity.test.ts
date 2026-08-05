import { afterEach, describe, expect, it, vi } from "vitest";
import { getDeployedCommitSha } from "@/shared/core/config/server/deployment-identity";

/**
 * Unit tests for the deployment-provenance accessor.
 *
 * Contract under test — every case here is a state a prober must be able to
 * tell apart, because "absent" and "present" mean different things downstream:
 * a missing SHA makes the production freshness check DEGRADE to a warning,
 * while a present one makes it a hard comparison. A blank value that leaked
 * through as `""` would look present and compare unequal forever, so blank
 * must normalise to absent rather than to an empty string.
 */

const SHA = "98ac0f36330ac42823821d021f5414b48bae70d0";

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getDeployedCommitSha", () => {
	it("returns the SHA when the platform injected one", () => {
		vi.stubEnv("VERCEL_GIT_COMMIT_SHA", SHA);
		expect(getDeployedCommitSha()).toBe(SHA);
	});

	it("returns undefined off-platform, where the variable is unset", () => {
		vi.stubEnv("VERCEL_GIT_COMMIT_SHA", undefined);
		expect(getDeployedCommitSha()).toBeUndefined();
	});

	it("treats a blank value as absent, not as an empty SHA", () => {
		vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "   ");
		expect(getDeployedCommitSha()).toBeUndefined();
	});

	it("trims surrounding whitespace so the SHA compares equal", () => {
		vi.stubEnv("VERCEL_GIT_COMMIT_SHA", `\n${SHA} `);
		expect(getDeployedCommitSha()).toBe(SHA);
	});
});
