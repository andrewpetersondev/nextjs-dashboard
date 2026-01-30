import "server-only";
import {
  UPDATE_SESSION_OUTCOME_REASON,
  type UpdateSessionNotRotatedDto,
  type UpdateSessionSuccessDto,
} from "@/modules/auth/application/dtos/update-session-outcome.dto";
import type {
  DurationSeconds,
  TimeDeltaSeconds,
} from "@/modules/auth/domain/values/auth-brands.value";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

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
 */
export function buildUpdateSessionSuccess(
  params: Readonly<{
    expiresAtMs: number;
    role: UserRole;
    userId: UserId;
  }>,
): Readonly<UpdateSessionSuccessDto> {
  if (params.expiresAtMs <= Date.now()) {
    throw new Error("Invalid rotation: expiresAtMs must be in the future");
  }

  return {
    expiresAtMs: params.expiresAtMs,
    reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
    refreshed: true,
    role: params.role,
    userId: params.userId,
  } as const;
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
