import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

export type IssueTokenInput = Readonly<{
  role: UserRole;
  sessionStart: number;
  userId: UserId;
}>;

export type IssuedToken = Readonly<{
  expiresAtMs: number;
  token: string;
}>;
