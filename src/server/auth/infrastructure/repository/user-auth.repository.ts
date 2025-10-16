import "server-only";
import type { AuthLoginDalInput } from "@/server/auth/domain/types/login.dto";
import type { AuthSignupDalInput } from "@/server/auth/domain/types/signup.dto";
import { getUserByEmailDal } from "@/server/auth/infrastructure/repository/dal/get-user-by-email.dal";
import { insertUserDal } from "@/server/auth/infrastructure/repository/dal/insert-user.dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { throwRepoDatabaseErr } from "@/server/errors/factories/layer-error-throw";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
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
} from "@/shared/core/errors/domain/domain-errors";

// Normalize without mutating; only include fields we expect in DAL.
function toNormalizedSignupInput(
  input: Readonly<AuthSignupDalInput>,
): AuthSignupDalInput {
  return {
    email: String(input.email).trim().toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role,
    username: String(input.username).trim(),
  };
}

function assertSignupFields(input: Readonly<AuthSignupDalInput>): void {
  if (!input.email || !input.passwordHash || !input.username || !input.role) {
    throw new ValidationError("Missing required fields for signup.");
  }
}

export function isRepoKnownError(
  err: unknown,
): err is ConflictError | ValidationError | DatabaseError {
  return (
    err instanceof ConflictError ||
    err instanceof ValidationError ||
    err instanceof DatabaseError
  );
}

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepo {
  protected readonly db: AppDatabase;
  private static readonly CTX = "repo.AuthUserRepo" as const;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /**
   * Runs a sequence of operations within a database transaction.
   * Keep thin; retries belong to a separate policy layer if needed.
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepo) => Promise<T>,
  ): Promise<T> {
    const dbWithTx = this.db as AppDatabase & {
      transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
    };
    try {
      return await dbWithTx.transaction(async (tx: AppDatabase) => {
        const txRepo = new AuthUserRepo(tx);
        return await fn(txRepo);
      });
    } catch (err) {
      serverLogger.error(
        { context: `${AuthUserRepo.CTX}.withTransaction`, kind: "db" },
        "Transaction failed",
      );
      throw err;
    }
  }

  /**
   * Creates a new user for the signup flow.
   * - Maps DAL conflicts to ConflictError.
   * - Enforces domain invariants before/after DAL calls.
   * - Surfaces infra/timeouts as DatabaseError with minimal context.
   */
  async signup(input: Readonly<AuthSignupDalInput>): Promise<UserEntity> {
    try {
      assertSignupFields(input);
      const normalized: AuthSignupDalInput = toNormalizedSignupInput(input);
      const row = await insertUserDal(this.db, normalized);
      if (!row) {
        return throwRepoDatabaseErr("User creation did not return a row.");
      }
      return newUserDbRowToEntity(row);
    } catch (err: unknown) {
      if (isRepoKnownError(err)) {
        throw err;
      }
      serverLogger.error(
        { context: `${AuthUserRepo.CTX}.signup`, kind: "unexpected" },
        "Unexpected error during signup repository operation",
      );
      return throwRepoDatabaseErr(
        "Database operation failed during signup.",
        err,
      );
    }
  }

  /**
   * Fetches a user by email for login.
   * - Maps not-found to Unauthorized (domain decision).
   * - Keeps DB errors normalized.
   */
  async login(input: Readonly<AuthLoginDalInput>): Promise<UserEntity> {
    try {
      const row = await getUserByEmailDal(this.db, input.email);
      if (!row?.password) {
        serverLogger.warn(
          {
            context: `${AuthUserRepo.CTX}.login`,
            kind: "not_found_or_missing_password",
          },
          "User not found or missing password",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }
      return userDbRowToEntity(row);
    } catch (err: unknown) {
      if (
        err instanceof UnauthorizedError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      serverLogger.error(
        {
          context: `${AuthUserRepo.CTX}.login`,
          kind: "unexpected",
        },
        "Unexpected error during login repository operation",
      );
      throw new DatabaseError("Database operation failed during login.", {
        context: `${AuthUserRepo.CTX}.login`,
      });
    }
  }
}
