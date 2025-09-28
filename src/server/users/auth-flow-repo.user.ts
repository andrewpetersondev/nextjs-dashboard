import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { AuthSignupDalInput } from "@/server/users/dal/auth-flow-signup.dal";
import { dalAuthFlowSignup } from "@/server/users/dal/auth-flow-signup.dal";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";

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
   * Throws BaseError-derived classes:
   * - ConflictError (409) when unique constraints fail (email/username).
   * - UnauthorizedError (401) if preconditions deny signup.
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
      // Pass through known BaseError subclasses
      if (
        err instanceof ConflictError ||
        err instanceof UnauthorizedError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      // Wrap unknown errors as DatabaseError (BaseError-compatible)
      throw new DatabaseError(
        "Database operation failed during signup.",
        {},
        err as Error,
      );
    }
  }
}
