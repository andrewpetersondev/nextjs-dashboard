import type { ReadSessionOutcomeDto } from "@/modules/auth/application/session/dtos/responses/read-session-outcome.dto";
import {
	getSessionTimeLeftSec,
	type SessionEntity,
} from "@/modules/auth/domain/session/entities/session.entity";
import type { UnixSeconds } from "@/modules/auth/domain/session/value-objects/auth-brands.value";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Builds a ReadSessionOutcomeDto from a SessionEntity.
 *
 * @remarks
 * This builder is intentionally strict:
 * if the session is already expired (negative time left), upstream should have
 * handled it and terminated/cleared the session.
 *
 * Non-throwing: returns a Result so request flows can degrade gracefully.
 */
export function buildReadSessionOutcome(
	session: SessionEntity,
	nowSec: UnixSeconds,
): Result<Readonly<ReadSessionOutcomeDto>, AppError> {
	const timeLeftSec = getSessionTimeLeftSec(session, nowSec);

	if (timeLeftSec < 0) {
		return Err(
			makeAppError(APP_ERROR_KEYS.validation, {
				cause: `Invalid session: computed timeLeftSec is negative (${String(timeLeftSec)})`,
				message: "Invalid session state",
				metadata: {
					policy: "session",
					reason: "negative_time_left_sec",
				},
			}),
		);
	}

	return Ok({
		expiresAtSec: session.expiresAt,
		id: session.userId,
		issuedAtSec: session.issuedAt,
		role: session.role,
		timeLeftSec,
	});
}
