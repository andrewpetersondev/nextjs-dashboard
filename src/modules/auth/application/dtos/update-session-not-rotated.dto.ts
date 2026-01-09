import type { UpdateSessionFailureReason } from "@/modules/auth/domain/policies/session.policy";

export type UpdateSessionNotRotatedDto = {
  readonly ageMs?: number;
  readonly maxMs?: number;
  readonly reason: UpdateSessionFailureReason;
  readonly refreshed: false;
  readonly timeLeftMs?: number;
};
