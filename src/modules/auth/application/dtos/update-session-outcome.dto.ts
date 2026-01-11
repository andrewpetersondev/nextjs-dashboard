import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

export type UpdateSessionFailureReason =
  | "absolute_lifetime_exceeded"
  | "invalid_or_missing_user"
  | "no_cookie"
  | "not_needed";

export type UpdateSessionNotRotatedDto = {
  readonly ageSec?: number;
  readonly maxSec?: number;
  readonly reason: UpdateSessionFailureReason;
  readonly refreshed: false;
  readonly timeLeftSec?: number;
};

export type UpdateSessionSuccessDto = {
  readonly expiresAt: number;
  readonly reason: "rotated";
  readonly refreshed: true;
  readonly role: UserRole;
  readonly userId: UserId;
};

export type UpdateSessionOutcomeDto =
  | UpdateSessionNotRotatedDto
  | UpdateSessionSuccessDto;
