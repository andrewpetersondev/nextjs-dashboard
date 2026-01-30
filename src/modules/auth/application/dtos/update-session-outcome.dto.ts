import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Centralized reason literals to avoid magic strings across DTOs, builders, and use cases.
 */
export const UPDATE_SESSION_OUTCOME_REASON = {
  absoluteLifetimeExceeded: "absolute_lifetime_exceeded",
  expired: "expired",
  invalidOrMissingUser: "invalid_or_missing_user",
  noCookie: "no_cookie",
  notNeeded: "not_needed",
  rotated: "rotated",
} as const;

export type UpdateSessionTerminationNotRotatedDto = Readonly<{
  readonly ageSec: number;
  readonly maxSec: number;
  readonly reason:
    | typeof UPDATE_SESSION_OUTCOME_REASON.absoluteLifetimeExceeded
    | typeof UPDATE_SESSION_OUTCOME_REASON.expired;
  readonly refreshed: false;
}>;

export type UpdateSessionNoSessionNotRotatedDto = Readonly<{
  readonly reason:
    | typeof UPDATE_SESSION_OUTCOME_REASON.invalidOrMissingUser
    | typeof UPDATE_SESSION_OUTCOME_REASON.noCookie;
  readonly refreshed: false;
}>;

export type UpdateSessionNotNeededNotRotatedDto = Readonly<{
  readonly reason: typeof UPDATE_SESSION_OUTCOME_REASON.notNeeded;
  readonly refreshed: false;
  readonly timeLeftSec: number;
}>;

export type UpdateSessionNotRotatedDto =
  | UpdateSessionNoSessionNotRotatedDto
  | UpdateSessionNotNeededNotRotatedDto
  | UpdateSessionTerminationNotRotatedDto;

export type UpdateSessionSuccessDto = {
  readonly expiresAt: number;
  readonly reason: typeof UPDATE_SESSION_OUTCOME_REASON.rotated;
  readonly refreshed: true;
  readonly role: UserRole;
  readonly userId: UserId;
};

export type UpdateSessionOutcomeDto =
  | UpdateSessionNotRotatedDto
  | UpdateSessionSuccessDto;
