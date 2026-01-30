import type { IssueTokenRequestDto } from "@/modules/auth/application/session/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/session-token-claims.dto";
import { UserIdSchema } from "@/modules/auth/application/session/schemas/session-token-claims.schema";

/**
 * Maps a token issuance request to the application-level claims DTO.
 * Encapsulates the transformation of branded types to transport strings.
 */
export function toSessionTokenClaimsDto(
  input: IssueTokenRequestDto,
  params: Readonly<{
    exp: number;
    iat: number;
    jti: string;
    sid: string;
  }>,
): SessionTokenClaimsDto {
  return {
    exp: params.exp,
    iat: params.iat,
    jti: params.jti,
    nbf: params.iat,
    role: input.role,
    sid: params.sid,
    sub: UserIdSchema.encode(input.userId),
  };
}
