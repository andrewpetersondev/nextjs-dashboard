import type {
  IssuedToken,
  IssueTokenInput,
} from "@/modules/auth/application/dtos/issue-token.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export interface SessionTokenServiceContract {
  issue(input: IssueTokenInput): Promise<Result<IssuedToken, AppError>>;
  decode(token: string): Promise<Result<SessionTokenClaims, AppError>>;
  validate(claims: unknown): Result<SessionTokenClaims, AppError>;
}
