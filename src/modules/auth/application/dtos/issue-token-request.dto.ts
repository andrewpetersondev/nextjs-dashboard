import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

export type IssueTokenRequestDto = Readonly<{
  role: UserRole;
  userId: UserId;
}>;
