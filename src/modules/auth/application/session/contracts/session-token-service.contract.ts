import type { IssueRotatedTokenCommand } from "@/modules/auth/application/session/dtos/requests/issue-rotated-token.command";
import type { IssueTokenCommand } from "@/modules/auth/application/session/dtos/requests/issue-token.command";
import type { IssuedTokenDto } from "@/modules/auth/application/session/dtos/responses/issue-token.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Application contract for session token operations.
 */
export interface SessionTokenServiceContract {
  /**
   * Decodes an encoded session token.
   *
   * Contract: this returns decoded-but-untrusted payload. Call `validate()` to
   * enforce schema/invariants and obtain application-level claims.
   *
   * @param token - The encoded session token string.
   * @returns A Result containing the decoded token payload or an AppError.
   */
  decode(token: string): Promise<Result<unknown, AppError>>;

  /**
   * Issues a brand-new session token for a new session.
   *
   * Generates a new session ID (sid) and JWT ID (jti).
   *
   * @param input - The command for issuing a new token.
   * @returns A Result containing the newly issued token DTO or an AppError.
   */
  issue(input: IssueTokenCommand): Promise<Result<IssuedTokenDto, AppError>>;

  /**
   * Issues a rotated session token for an existing session.
   *
   * Reuses the provided session ID (sid) and generates a new JWT ID (jti).
   *
   * @param input - The command for issuing a rotated token.
   * @returns A Result containing the rotated token DTO or an AppError.
   */
  issueRotated(
    input: IssueRotatedTokenCommand,
  ): Promise<Result<IssuedTokenDto, AppError>>;

  /**
   * Validates decoded claims against the session token schema.
   *
   * @param claims - The claims to validate (typically from a decoded token).
   * @returns A Result containing the validated session token claims or an AppError.
   */
  validate(claims: unknown): Promise<Result<SessionTokenClaimsDto, AppError>>;
}
