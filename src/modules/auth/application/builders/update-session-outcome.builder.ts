import "server-only";

import type {
  UpdateSessionNotRotatedDto,
  UpdateSessionSuccessDto,
} from "@/modules/auth/application/dtos/update-session-outcome.dto";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

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
    expiresAt: params.expiresAtMs,
    reason: "rotated",
    refreshed: true,
    role: params.role,
    userId: params.userId,
  } as const;
}

/**
 * Builds a not-rotated outcome with optional lifecycle metadata (seconds).
 */
export function buildUpdateSessionNotRotated(
  params: Readonly<{
    ageSec?: number;
    maxSec?: number;
    reason:
      | "absolute_lifetime_exceeded"
      | "invalid_or_missing_user"
      | "no_cookie"
      | "not_needed";
    timeLeftSec?: number;
  }>,
): Readonly<UpdateSessionNotRotatedDto> {
  return {
    ageSec: params.ageSec,
    maxSec: params.maxSec,
    reason: params.reason,
    refreshed: false,
    timeLeftSec: params.timeLeftSec,
  } as const;
}
