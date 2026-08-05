import { classifyFreshness } from "@devtools/shared/deploy-identity";
import { describe, expect, it } from "vitest";

/**
 * Unit tests for the deployment-freshness decision.
 *
 * This is the whole judgement the production watchdog makes about whether a SHA
 * mismatch is a failed build or a deploy still in progress; everything around it
 * is I/O. The threshold is 30 minutes, and these tests pin it — including the
 * boundary, since "in flight" is deliberately exclusive of the cutoff.
 *
 * Why the distinction earns tests at all: getting it wrong in the loose
 * direction hides a failed build behind a "still deploying" note, and getting it
 * wrong in the strict direction fails the run every time it happens to fire
 * mid-deploy, which is how a watchdog trains you to ignore it.
 */

const DEPLOYED = "98ac0f36330ac42823821d021f5414b48bae70d0";
const NEWER = "7e764333d0a1b2c3d4e5f60718293a4b5c6d7e8f";

const MINUTE = 60;
const THRESHOLD_MINUTES = 30;

describe("classifyFreshness", () => {
	it("reports current when the deployment matches main", () => {
		expect(classifyFreshness(DEPLOYED, DEPLOYED, null)).toEqual({
			kind: "current",
		});
	});

	it("reports current regardless of how old the matching commit is", () => {
		expect(
			classifyFreshness(DEPLOYED, DEPLOYED, 90 * 24 * 60 * MINUTE),
		).toEqual({ kind: "current" });
	});

	it("treats a just-pushed mismatch as a deploy in flight", () => {
		expect(classifyFreshness(DEPLOYED, NEWER, 0)).toEqual({
			kind: "in-flight",
			lagSeconds: 0,
		});
	});

	it("still treats a mismatch as in flight one minute below the threshold", () => {
		const lagSeconds = (THRESHOLD_MINUTES - 1) * MINUTE;
		expect(classifyFreshness(DEPLOYED, NEWER, lagSeconds)).toEqual({
			kind: "in-flight",
			lagSeconds,
		});
	});

	it("calls a mismatch stale exactly AT the threshold, not past it", () => {
		const lagSeconds = THRESHOLD_MINUTES * MINUTE;
		expect(classifyFreshness(DEPLOYED, NEWER, lagSeconds)).toEqual({
			kind: "stale",
			lagSeconds,
		});
	});

	it("calls a long-standing mismatch stale", () => {
		const lagSeconds = 6 * 60 * MINUTE;
		expect(classifyFreshness(DEPLOYED, NEWER, lagSeconds)).toEqual({
			kind: "stale",
			lagSeconds,
		});
	});

	it("reports undatable when the expected commit cannot be dated locally", () => {
		expect(classifyFreshness(DEPLOYED, NEWER, null)).toEqual({
			kind: "undatable",
		});
	});
});
