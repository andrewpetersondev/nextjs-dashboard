import "server-only";
import {
  UPDATE_SESSION_OUTCOME_REASON,
  type UpdateSessionNotRotatedDto,
  type UpdateSessionSuccessDto,
} from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import type {
  DurationSeconds,
  TimeDeltaSeconds,
} from "@/modules/auth/domain/session/value-objects/auth-brands.value";
import type { UserId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import type { UserRole } from "@/shared/validation/user-role/user-role.constants";

type UpdateSessionNotRotatedParams = Readonly<
  | {
      readonly reason:
        | typeof UPDATE_SESSION_OUTCOME_REASON.invalidOrMissingUser
        | typeof UPDATE_SESSION_OUTCOME_REASON.noCookie;
    }
  | {
      readonly reason: typeof UPDATE_SESSION_OUTCOME_REASON.notNeeded;
      readonly timeLeftSec: TimeDeltaSeconds;
    }
  | {
      readonly reason:
        | typeof UPDATE_SESSION_OUTCOME_REASON.absoluteLifetimeExceeded
        | typeof UPDATE_SESSION_OUTCOME_REASON.expired;
      readonly ageSec: DurationSeconds;
      readonly maxSec: DurationSeconds;
    }
>;

/**
 * Builds a successful rotation outcome.
 *
 * Non-throwing: returns a Result so callers can propagate an AppError instead of 500-ing.
 */
export function buildUpdateSessionSuccess(
  params: Readonly<{
    expiresAtMs: number;
    role: UserRole;
    userId: UserId;
  }>,
): Result<Readonly<UpdateSessionSuccessDto>, AppError> {
  if (params.expiresAtMs <= Date.now()) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: `Invalid rotation: expiresAtMs must be in the future (${String(params.expiresAtMs)})`,
        message: "Invalid session rotation state",
        metadata: {
          policy: "session",
          reason: "rotation_expires_at_not_in_future",
        },
      }),
    );
  }

  return Ok({
    expiresAtMs: params.expiresAtMs,
    reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
    refreshed: true,
    role: params.role,
    userId: params.userId,
  } as const);
}

/**
 * Builds a not-rotated outcome.
 *
 * Note: The discriminated union keeps payloads reason-specific (non-optional)
 * without relying on overload signatures.
 */
export function buildUpdateSessionNotRotated(
  params: UpdateSessionNotRotatedParams,
): Readonly<UpdateSessionNotRotatedDto> {
  if (params.reason === UPDATE_SESSION_OUTCOME_REASON.notNeeded) {
    return {
      reason: params.reason,
      refreshed: false,
      timeLeftSec: params.timeLeftSec,
    } as const;
  }

  if (
    params.reason === UPDATE_SESSION_OUTCOME_REASON.absoluteLifetimeExceeded ||
    params.reason === UPDATE_SESSION_OUTCOME_REASON.expired
  ) {
    return {
      ageSec: params.ageSec,
      maxSec: params.maxSec,
      reason: params.reason,
      refreshed: false,
    } as const;
  }

  return {
    reason: params.reason,
    refreshed: false,
  } as const;
}
