import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Domain-specific contract for persisting and retrieving the raw session token.
 * implemented by infrastructure adapters (Cookies, Redis, etc.).
 */
export interface SessionStoreContract {
  /**
   * Removes the session from the underlying storage.
   *
   * @returns A Result indicating success or an AppError.
   */
  delete(): Promise<Result<void, AppError>>;

  /**
   * Retrieves the current session token from storage if it exists.
   *
   * @returns A Result containing the token string, undefined if not found, or an AppError.
   */
  get(): Promise<Result<string | undefined, AppError>>;

  /**
   * Persists the session token with a specific expiration time.
   *
   * @param value - The encoded session token to store.
   * @param expiresAtMs - Absolute expiration time in milliseconds.
   * @returns A Result indicating success or an AppError.
   */
  set(value: string, expiresAtMs: number): Promise<Result<void, AppError>>;
}
