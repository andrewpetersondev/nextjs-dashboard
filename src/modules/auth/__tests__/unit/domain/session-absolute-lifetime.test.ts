import { describe, expect, it } from "vitest";
import {
	isSessionAbsoluteLifetimeExceeded,
	type SessionEntity,
} from "@/modules/auth/domain/session/entities/session.entity";
import { evaluateSessionLifecyclePolicy } from "@/modules/auth/domain/session/policies/evaluate-session-lifecycle.policy";
import { toUnixSeconds } from "@/modules/auth/domain/session/value-objects/time.value";
import {
	MAX_ABSOLUTE_SESSION_SEC,
	SESSION_DURATION_SEC,
} from "@/modules/auth/domain/shared/constants/session-config.constants";
import { SESSION_LIFECYCLE_REASONS } from "@/modules/auth/domain/shared/constants/session-lifecycle.constants";
import { toUserId } from "@/modules/users/domain/user-id.mappers";

/**
 * Regression lock for the absolute session ceiling.
 *
 * The ceiling used to measure age from `issuedAt` (the JWT `iat`). Rotation mints
 * a fresh `iat`, so an actively used session's measured age reset every few
 * minutes and `MAX_ABSOLUTE_SESSION_SEC` could never be reached — the termination
 * path was unreachable code. Age is now measured from `startedAt`, which rotation
 * carries forward untouched.
 *
 * Every test below therefore pins `issuedAt` to *now* — exactly what a
 * just-rotated token looks like — and varies only `startedAt`.
 */

const NOW = toUnixSeconds(1_800_000_000);
const USER_ID = toUserId("00000000-0000-4000-8000-000000000003");

/**
 * Builds a session as it looks immediately after a rotation: a brand-new token
 * (fresh `issuedAt`, full remaining lifetime) belonging to a session that began
 * `sessionAgeSec` ago.
 */
function makeRotatedSession(sessionAgeSec: number): SessionEntity {
	return {
		expiresAt: toUnixSeconds(NOW + SESSION_DURATION_SEC),
		issuedAt: NOW,
		role: "USER",
		startedAt: toUnixSeconds(NOW - sessionAgeSec),
		userId: USER_ID,
	};
}

describe("session absolute lifetime ceiling", () => {
	describe("isSessionAbsoluteLifetimeExceeded", () => {
		it("measures age from startedAt, not from the freshly rotated issuedAt", () => {
			const session = makeRotatedSession(MAX_ABSOLUTE_SESSION_SEC + 1);

			const { ageSec, exceeded } = isSessionAbsoluteLifetimeExceeded(
				session,
				MAX_ABSOLUTE_SESSION_SEC,
				NOW,
			);

			// Age reflects the session (31 days), not the token (0 seconds old).
			expect(ageSec).toBe(MAX_ABSOLUTE_SESSION_SEC + 1);
			expect(exceeded).toBe(true);
		});

		it("does not exceed exactly at the ceiling", () => {
			const { exceeded } = isSessionAbsoluteLifetimeExceeded(
				makeRotatedSession(MAX_ABSOLUTE_SESSION_SEC),
				MAX_ABSOLUTE_SESSION_SEC,
				NOW,
			);

			expect(exceeded).toBe(false);
		});

		it("exceeds one second past the ceiling", () => {
			const { exceeded } = isSessionAbsoluteLifetimeExceeded(
				makeRotatedSession(MAX_ABSOLUTE_SESSION_SEC + 1),
				MAX_ABSOLUTE_SESSION_SEC,
				NOW,
			);

			expect(exceeded).toBe(true);
		});

		it("reports a young session as not exceeded", () => {
			const { ageSec, exceeded } = isSessionAbsoluteLifetimeExceeded(
				makeRotatedSession(60),
				MAX_ABSOLUTE_SESSION_SEC,
				NOW,
			);

			expect(ageSec).toBe(60);
			expect(exceeded).toBe(false);
		});
	});

	describe("evaluateSessionLifecyclePolicy", () => {
		it("terminates an over-age session even though its token was just rotated", () => {
			const decision = evaluateSessionLifecyclePolicy(
				makeRotatedSession(MAX_ABSOLUTE_SESSION_SEC + 1),
				NOW,
			);

			expect(decision).toEqual({
				action: "terminate",
				ageSec: MAX_ABSOLUTE_SESSION_SEC + 1,
				maxSec: MAX_ABSOLUTE_SESSION_SEC,
				reason: SESSION_LIFECYCLE_REASONS.ABSOLUTE_LIMIT_EXCEEDED,
			});
		});

		it("continues a long-lived-but-under-ceiling session", () => {
			const decision = evaluateSessionLifecyclePolicy(
				makeRotatedSession(MAX_ABSOLUTE_SESSION_SEC - 1),
				NOW,
			);

			expect(decision.action).toBe("continue");
			expect(decision.reason).toBe(SESSION_LIFECYCLE_REASONS.VALID);
		});

		it("prefers the absolute-limit reason over plain expiry when both apply", () => {
			const overAge = makeRotatedSession(MAX_ABSOLUTE_SESSION_SEC + 1);
			const expired: SessionEntity = {
				...overAge,
				expiresAt: toUnixSeconds(NOW - 1),
			};

			const decision = evaluateSessionLifecyclePolicy(expired, NOW);

			expect(decision.reason).toBe(
				SESSION_LIFECYCLE_REASONS.ABSOLUTE_LIMIT_EXCEEDED,
			);
		});

		it("still terminates an expired session that is under the ceiling", () => {
			const session: SessionEntity = {
				...makeRotatedSession(60),
				expiresAt: toUnixSeconds(NOW - 1),
			};

			const decision = evaluateSessionLifecyclePolicy(session, NOW);

			expect(decision.action).toBe("terminate");
			expect(decision.reason).toBe(SESSION_LIFECYCLE_REASONS.EXPIRED);
		});
	});
});
