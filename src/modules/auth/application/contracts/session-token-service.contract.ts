import "server-only";

import type {
  IssuedToken,
  IssueTokenInput,
} from "@/modules/auth/application/dtos/issue-token.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Contract for session token operations.
 */
export interface SessionTokenServiceContract {
  /**
   * Issues a new session token with the provided claims.
   */
  issue(input: IssueTokenInput): Promise<Result<IssuedToken, AppError>>;

  /**
   * Decodes a token and returns the raw payload.
   */
  decode(token: string): Promise<Result<SessionTokenClaims, AppError>>;

  /**
   * Validates decoded claims against the schema.
   */
  validate(claims: unknown): Result<SessionTokenClaims, AppError>;
}
