import "server-only";

import { findUserForLogin } from "@/server/auth/dal/user-auth-login.dal";
import { createUserForSignup } from "@/server/auth/dal/user-auth-signup.dal";
import type { AuthLoginDalInput } from "@/server/auth/types/login.dtos";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/server/users/mapping/user.mappers";
import type { UserEntity } from "@/server/users/types/entity";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepo {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates a new user for the auth/signup flow.
   * @param input - AuthSignupDalInput
   * @returns UserEntity
   * @throws ConflictError | ValidationError | DatabaseError
   */
  async signup(input: AuthSignupDalInput): Promise<UserEntity> {
    try {
      const row = await createUserForSignup(this.db, input);

      if (!row) {
        throw new ValidationError("Email, username and password are required.");
      }

      return newUserDbRowToEntity(row);
    } catch (err) {
      if (
        err instanceof ConflictError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      serverLogger.error({
        context: "AuthUserRepo.signup",
        error: err,
        message: "Unexpected error during signup repository operation.",
      });
      throw new DatabaseError(
        "Database operation failed during signup.",
        {},
        err instanceof Error ? err : undefined,
      );
    }
  }

  /**
   * Fetches a user by email for login; Service will verify password against stored hash.
   * @param input - AuthLoginDalInput
   * @returns UserEntity
   * @throws UnauthorizedError | ValidationError | DatabaseError
   */
  async login(input: AuthLoginDalInput): Promise<UserEntity> {
    try {
      // DAL returns the user row by email; no password comparison here.
      const row = await findUserForLogin(this.db, input.email);

      if (!row) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      // Defensive: ensure hashed password exists on the row before mapping
      if (!row.password || typeof row.password !== "string") {
        serverLogger.error(
          { context: "AuthUserRepo.login", email: input.email },
          "User row missing hashed password; cannot authenticate",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }

      return userDbRowToEntity(row);
    } catch (err) {
      if (
        err instanceof UnauthorizedError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      serverLogger.error({
        context: "AuthUserRepo.login",
        email: input?.email,
        error: err,
        message: "Unexpected error during login repository operation.",
      });
      throw new DatabaseError(
        "Database operation failed during login.",
        {},
        err instanceof Error ? err : undefined,
      );
    }
  }
}
