import type { IssueRotatedTokenRequestDto } from "@/modules/auth/application/dtos/issue-rotated-token-request.dto";
import type { IssuedTokenDto } from "@/modules/auth/application/dtos/issue-token.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Application contract for session token operations.
 */
export interface SessionTokenServiceContract {
  decode(token: string): Promise<Result<SessionTokenClaimsDto, AppError>>;

  /**
   * Issues a brand-new session token (new session).
   * Generates a new `sid` + `jti`.
   */
  issue(input: IssueTokenRequestDto): Promise<Result<IssuedTokenDto, AppError>>;

  /**
   * Issues a rotated session token (existing session).
   * Reuses the provided `sid`, generates a new `jti`.
   */
  issueRotated(
    input: IssueRotatedTokenRequestDto,
  ): Promise<Result<IssuedTokenDto, AppError>>;

  /**
   * Validates decoded claims against the schema.
   */
  validate(claims: unknown): Promise<Result<SessionTokenClaimsDto, AppError>>;
}
