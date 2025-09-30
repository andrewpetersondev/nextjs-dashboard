import "server-only";

import { findUserForLogin } from "@/server/auth/dal/user-auth-login.dal";
import { createUserForSignup } from "@/server/auth/dal/user-auth-signup.dal";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import type { UserEntity } from "@/server/users/entity";
import type {
  AuthLoginDalInput,
  AuthSignupDalInput,
} from "@/server/users/types";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";

// Centralized error passthrough check to keep methods concise.
function isKnownAuthError(err: unknown): boolean {
  return (
    err instanceof ConflictError ||
    err instanceof UnauthorizedError ||
    err instanceof ValidationError ||
    err instanceof DatabaseError
  );
}

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
   * May throw ConflictError, UnauthorizedError, ValidationError, DatabaseError.
   */
  async signup(input: AuthSignupDalInput): Promise<UserEntity> {
    try {
      const entity = await createUserForSignup(this.db, input);
      return entity;
    } catch (err) {
      if (isKnownAuthError(err)) {
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
   * Authenticates a user by email/password.
   * May throw UnauthorizedError, ValidationError, DatabaseError.
   */
  async login(input: AuthLoginDalInput): Promise<UserEntity> {
    try {
      const entity = await findUserForLogin(
        this.db,
        input.email,
        input.password,
      );
      return entity;
    } catch (err) {
      if (isKnownAuthError(err)) {
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
