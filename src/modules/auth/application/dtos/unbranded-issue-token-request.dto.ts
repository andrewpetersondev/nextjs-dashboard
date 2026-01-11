import type { UserRole } from "@/shared/domain/user/user-role.types";

// todo: why is this not readonly? should it be?

// todo: is this type just a dto? it is a subset of SessionEntity but with userId as plain string instead of branded
//  string. it is IssueTokenRequestDto but with userId as string. should i just use IssueTokenRequestDto and decode

/**
 * Parameters for preparing decoded session data for token issuance.
 */
export type UnbrandedIssueTokenRequestDto = {
  role: UserRole;
  sessionStart: number;
  userId: string;
};
