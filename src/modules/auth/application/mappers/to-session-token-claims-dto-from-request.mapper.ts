import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { UserIdSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";

/**
 * Maps a token issuance request to the application-level claims DTO.
 * Encapsulates the transformation of branded types to transport strings.
 */
export function toSessionTokenClaimsDtoFromRequest(
  input: IssueTokenRequestDto,
  iat: number,
  exp: number,
): SessionTokenClaimsDto {
  return {
    exp,
    iat,
    role: input.role,
    sub: UserIdSchema.encode(input.userId),
  };
}
