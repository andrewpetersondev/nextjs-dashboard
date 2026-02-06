import type { IssueTokenCommand } from "@/modules/auth/application/session/dtos/requests/issue-token.command";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import { UserIdSchema } from "@/shared/validation/zod/user-id.schema";

/**
 * Maps a token issuance request to the application-level claims DTO.
 * Encapsulates the transformation of branded types to transport strings.
 */
export function toSessionTokenClaimsDto(
  input: IssueTokenCommand,
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
