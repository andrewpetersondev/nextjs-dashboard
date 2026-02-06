import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/validation/user/user-role.schema";

export type IssueTokenCommand = Readonly<{
  role: UserRole;
  userId: UserId;
}>;
