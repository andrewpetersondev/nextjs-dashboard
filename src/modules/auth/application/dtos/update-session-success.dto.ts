import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

export type UpdateSessionSuccessDto = {
  readonly expiresAt: number;
  readonly reason: "rotated";
  readonly refreshed: true;
  readonly role: UserRole;
  readonly userId: UserId;
};
