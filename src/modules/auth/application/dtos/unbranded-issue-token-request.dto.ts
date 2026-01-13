import type { UserRole } from "@/shared/domain/user/user-role.types";

// TODO: why is this not readonly? should it be?

// TODO: is this type just a dto? it is a subset of SessionEntity but with userId as plain string instead of branded
//  string. it is IssueTokenRequestDto but with userId as string. should i just use IssueTokenRequestDto and decode

/**
 * Parameters for preparing decoded session data for token issuance.
 * Plain-string userId version of IssueTokenRequestDto.
 */
export type UnbrandedIssueTokenRequestDto = {
  role: UserRole;
  userId: string;
};
