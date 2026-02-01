import type { Hash } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Application-layer contract for password hashing and verification.
 *
 * This port defines the requirements for password security without
 * coupling the application core to specific crypto implementations.
 */
export interface PasswordHasherContract {
  /**
   * Compares a raw password against a stored hash.
   *
   * @param password - The raw password to verify
   * @param hash - The stored hash to compare against
   * @returns Result indicating if the password matches, or AppError for technical failures
   */
  compare(password: string, hash: Hash): Promise<Result<boolean, AppError>>;

  /**
   * Hashes a raw password for secure storage.
   *
   * @param password - The raw password to hash
   * @returns Result containing the resulting hash, or AppError for technical failures
   */
  hash(password: string): Promise<Result<Hash, AppError>>;
}
