import "server-only";

import type { Hash } from "@/shared/branding/brands";

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
   * @returns True if the password matches the hash
   */
  compare(password: string, hash: Hash): Promise<boolean>;

  /**
   * Hashes a raw password for secure storage.
   *
   * @param password - The raw password to hash
   * @returns The resulting hash
   */
  hash(password: string): Promise<Hash>;
}
