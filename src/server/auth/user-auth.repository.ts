import "server-only";
import { findUserForLogin } from "@/server/auth/dal/user-auth-login.dal";
import { createUserForSignup } from "@/server/auth/dal/user-auth-signup.dal";
import type { AuthLoginDalInput } from "@/server/auth/types/login.dtos";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { AppDatabase } from "@/server/db/db.connection";
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

// Centralized retry/backoff policy (injectable if needed)
const REPO_RETRY = {
  attempts: 2 as const,
  delayMs: 50 as const,
} as const;

// Known PG concurrency/timeout codes for retry/log hints.
const RETRIABLE_PG = new Set(["40001", "40P01", "55P03", "57014"] as const);
type RetriableCode = "40001" | "40P01" | "55P03" | "57014";

function getPgCode(e: unknown): string | undefined {
  const maybe = e as { code?: unknown } | null;
  return typeof maybe?.code === "string" ? maybe.code : undefined;
}

function isRetriable(e: unknown): e is { code: RetriableCode } {
  const code = getPgCode(e);
  return !!code && RETRIABLE_PG.has(code as RetriableCode);
}

async function retry<T>(
  fn: () => Promise<T>,
  opts: {
    attempts: number;
    delayMs: number;
    context: string;
    ids?: Record<string, unknown>;
  },
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < opts.attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const code = getPgCode(e);
      if (!isRetriable(e) || i === opts.attempts - 1) {
        break;
      }
      serverLogger.warn(
        { attempt: i + 1, code, context: opts.context, ...(opts.ids ?? {}) },
        "Retriable repository error; will retry",
      );
      await new Promise((r) => setTimeout(r, opts.delayMs));
    }
  }
  throw lastErr;
}

// --- Utility: Normalize input for signup, to enforce invariants early ---
function toNormalizedSignupInput(
  input: AuthSignupDalInput,
): AuthSignupDalInput {
  return {
    ...input,
    email: String(input.email).trim().toLowerCase(),
    username: String(input.username).trim(),
  };
}

// --- Utility: Validate mandatory signup fields (domain-side preconditions) ---
function assertSignupFields(input: AuthSignupDalInput): void {
  if (!input.email || !input.passwordHash || !input.username || !input.role) {
    throw new ValidationError("Missing required fields for signup.");
  }
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
   * Uses centralized retry policy for known concurrency/timeout errors.
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepo) => Promise<T>,
  ): Promise<T> {
    const runOnce = async () => {
      const dbWithTx = this.db as AppDatabase & {
        transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
      };
      return await dbWithTx.transaction(async (tx: AppDatabase) => {
        const txRepo = new AuthUserRepo(tx);
        return await fn(txRepo);
      });
    };

    try {
      return await retry(runOnce, {
        attempts: REPO_RETRY.attempts,
        context: `${AuthUserRepo.CTX}.withTransaction`,
        delayMs: REPO_RETRY.delayMs,
      });
    } catch (err) {
      serverLogger.error(
        { context: `${AuthUserRepo.CTX}.withTransaction`, err, kind: "db" },
        "Transaction failed",
      );
      throw err;
    }
  }

  /**
   * Deterministic upsert helper: create-or-get by unique email.
   * Returns entity if exists or newly created. Maps conflicts to success (get).
   */
  async upsertUserByEmail(input: AuthSignupDalInput): Promise<UserEntity> {
    return await this.withTransaction(async (txRepo) => {
      try {
        // Try to create first (fast path)
        const created = await txRepo.signup(input);
        return created;
      } catch (e) {
        // If conflict, fetch existing deterministically
        if (e instanceof ConflictError) {
          const existing = await findUserForLogin(
            (txRepo as AuthUserRepo).db,
            input.email,
          );
          if (!existing) {
            // Extremely rare: conflict but no row (race with delete). Surface as DB error.
            throw new DatabaseError(
              "Conflict detected but existing row not found.",
              {
                context: `${AuthUserRepo.CTX}.upsertUserByEmail`,
              },
            );
          }
          if (!existing.password) {
            serverLogger.error(
              {
                context: `${AuthUserRepo.CTX}.upsertUserByEmail`,
                kind: "auth-invariant",
              },
              "Existing user missing password after conflict",
            );
            throw new DatabaseError("Existing user missing required fields.", {
              context: `${AuthUserRepo.CTX}.upsertUserByEmail`,
            });
          }
          return userDbRowToEntity(existing);
        }
        throw e;
      }
    });
  }

  /**
   * Optimistic locking example for future updates:
   * Expects a version field on the entity/table; throws ConflictError on lost update.
   */
  async updateUserWithVersion(opts: {
    id: string;
    expectedVersion: number;
    patch: Readonly<Partial<Pick<UserEntity, "username" | "role">>>;
  }): Promise<UserEntity> {
    return await this.withTransaction(async (txRepo) => {
      // Fetch current
      const current = await findUserForLogin(
        (txRepo as AuthUserRepo).db,
        opts.id /* replace with a find-by-id DAL */ as unknown as string,
      );
      if (!current) {
        throw new DatabaseError("User not found.", {
          context: `${AuthUserRepo.CTX}.updateUserWithVersion`,
        });
      }

      // Pseudocode: perform UPDATE ... WHERE id=? AND version=expectedVersion RETURNING *
      // If no row returned, treat as version conflict.
      const updated = current; // replace with actual DAL update call returning row

      // Example postcondition check
      if (!updated) {
        throw new ConflictError("Concurrent modification detected.", {
          context: `${AuthUserRepo.CTX}.updateUserWithVersion`,
        });
      }
      return userDbRowToEntity(updated);
    });
  }

  /**
   * Creates a new user for the signup flow.
   * - Maps DAL conflicts to ConflictError.
   * - Enforces domain invariants before/after DAL calls.
   * - Surfaces infra/timeouts as DatabaseError with minimal context.
   */
  async signup(input: AuthSignupDalInput): Promise<UserEntity> {
    try {
      assertSignupFields(input);
      const normalized = toNormalizedSignupInput(input);

      const row = await createUserForSignup(this.db, normalized);
      if (!row) {
        // Postcondition invariant: DAL must return a row.
        throw new DatabaseError("User creation did not return a row.", {
          context: `${AuthUserRepo.CTX}.signup`,
        });
      }
      return newUserDbRowToEntity(row);
    } catch (err: unknown) {
      if (
        err instanceof ConflictError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      const code = getPgCode(err);
      serverLogger.error(
        {
          context: `${AuthUserRepo.CTX}.signup`,
          kind: "unexpected",
          ...(code ? { code } : {}),
        },
        "Unexpected error during signup repository operation",
      );
      throw new DatabaseError("Database operation failed during signup.", {
        context: `${AuthUserRepo.CTX}.signup`,
        ...(code ? { code } : {}),
      });
    }
  }

  /**
   * Fetches a user by email for login.
   * - Maps not-found to Unauthorized (domain decision).
   * - Keeps DB errors normalized.
   */
  async login(input: AuthLoginDalInput): Promise<UserEntity> {
    try {
      const row = await findUserForLogin(this.db, input.email);

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
      const code = getPgCode(err);
      serverLogger.error(
        {
          context: `${AuthUserRepo.CTX}.login`,
          kind: "unexpected",
          ...(code ? { code } : {}),
        },
        "Unexpected error during login repository operation",
      );
      throw new DatabaseError("Database operation failed during login.", {
        context: `${AuthUserRepo.CTX}.login`,
        ...(code ? { code } : {}),
      });
    }
  }
}
