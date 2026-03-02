import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { UserRole } from "@/shared/validation/user-role/user-role.constants";

export type IssueTokenCommand = Readonly<{
  role: UserRole;
  userId: UserId;
}>;
