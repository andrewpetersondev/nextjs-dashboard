import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { UnbrandedIssueTokenRequestDto } from "@/modules/auth/application/dtos/unbranded-issue-token-request.dto";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";

// todo: where should i place mappers like this? seems ok for now but what about long term? did i name
//  this function and file correctly? check project conventions

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
