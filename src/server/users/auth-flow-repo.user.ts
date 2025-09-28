import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { AuthSignupDalInput } from "@/server/users/dal/auth-flow-signup.dal";
import { dalAuthFlowSignup } from "@/server/users/dal/auth-flow-signup.dal";
import { UnauthorizedError } from "@/shared/core/errors/domain";

/**
 * Errors that the Auth repo can throw for signup.
 * - ConflictError: email/username already exists.
 * - DatabaseError: infrastructure failure.
 * - UnauthorizedError: reserved for flows that may depend on preconditions (e.g., invite-only).
 * - ValidationError: optional, if DAL throws for invariants beyond form schema (kept here for future use).
 */
export class ConflictError extends Error {
  readonly code = "CONFLICT";
  readonly statusCode = 409;
  constructor(
    message = "Resource already exists.",
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "ConflictError";
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
  constructor(message = "Validation failed.", options?: { cause?: unknown }) {
    super(message);
    this.name = "ValidationError";
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export type AuthRepoSignupOutput = {
  id: string;
  email: string;
  username: string;
  role: "user";
};

export class AuthUserRepo {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates a user for the auth/signup flow.
   *
   * Throws:
   * - ConflictError (409) when unique constraints fail (email/username).
   * - UnauthorizedError (401) if preconditions deny signup (invite-only, etc.).
   * - ValidationError (400) for additional invariants beyond form schema.
   * - DatabaseError (500) for infrastructure/DB failures.
   */
  async authRepoSignup(
    input: AuthSignupDalInput,
  ): Promise<AuthRepoSignupOutput> {
    try {
      // Optional repo-level guards; e.g., block signup in certain modes:
      // if (process.env.SIGNUP_DISABLED === "true") {
      //   throw new UnauthorizedError("Signups are currently disabled.");
      // }

      const entity = await dalAuthFlowSignup(this.db, input);

      return {
        email: entity.email,
        id: String(entity.id),
        role: "user",
        username: entity.username,
      };
    } catch (err) {
      if (
        err instanceof ConflictError ||
        err instanceof UnauthorizedError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      throw new DatabaseError(
        "Database operation failed during signup.",
        {},
        err as Error,
      );
    }
  }
}
