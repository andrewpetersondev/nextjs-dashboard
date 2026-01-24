import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Domain-specific contract for persisting and retrieving the raw session token.
 * implemented by infrastructure adapters (Cookies, Redis, etc.).
 */
export interface SessionStoreContract {
  /**
   * Removes the session from the underlying storage.
   */
  delete(): Promise<Result<void, AppError>>;

  /**
   * Retrieves the current session token if it exists.
   */
  get(): Promise<Result<string | undefined, AppError>>;

  /**
   * Persists the session token with a specific expiry.
   * @param value - The encoded session token
   * @param expiresAtMs - Absolute expiration time in milliseconds
   */
  set(value: string, expiresAtMs: number): Promise<Result<void, AppError>>;
}
