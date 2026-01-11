import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { UserRole } from "@/shared/domain/user/user-role.types";

// todo: where should i place mappers like this? in 'helpers' seems ok for now but what about long term? did i name
//  this function and file correctly? check project conventions

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

/**
 * Maps decoded session data to a token issuance request.
 *
 * Transforms the raw userId string into the proper codec-decoded format
 * required by the session token service.
 */
export function toIssueTokenRequestDto(
  params: UnbrandedIssueTokenRequestDto,
): IssueTokenRequestDto {
  return {
    role: params.role,
    sessionStart: params.sessionStart,
    userId: userIdCodec.decode(params.userId),
  };
}
