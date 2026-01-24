import type { IssuedTokenDto } from "@/modules/auth/application/dtos/issue-token.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Contract for session token operations.
 */
export interface SessionTokenServiceContract {
  /**
   * Decodes a token and returns the raw payload.
   */
  decode(token: string): Promise<Result<SessionTokenClaimsDto, AppError>>;

  /**
   * Issues a new session token with the provided claims.
   */
  issue(input: IssueTokenRequestDto): Promise<Result<IssuedTokenDto, AppError>>;

  /**
   * Validates decoded claims against the schema.
   */
  validate(claims: unknown): Promise<Result<SessionTokenClaimsDto, AppError>>;
}
