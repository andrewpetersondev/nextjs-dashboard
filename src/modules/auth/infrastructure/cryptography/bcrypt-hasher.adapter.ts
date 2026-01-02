import "server-only";

import bcryptjs from "bcryptjs";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { Hash } from "@/shared/branding/brands";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

const SALT_ROUNDS = 10 as const;

/**
 * Bcrypt-based implementation of the auth-specific PasswordHasherContract.
 *
 * ## Layering
 * This class belongs to the **infrastructure** layer as it wraps the
 * `bcryptjs` library.
 */
export class BcryptHasherAdapter implements PasswordHasherContract {
  /**
   * Hashes a password using bcrypt.
   *
   * @param password - Plain text password
   */
  async hash(password: string): Promise<Hash> {
    try {
      const salt = await bcryptjs.genSalt(SALT_ROUNDS);
      const hashed = await bcryptjs.hash(password, salt);
      return toHash(hashed);
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err instanceof Error ? err : String(err),
        message: "Failed to hash password",
        metadata: {},
      });
    }
  }

  /**
   * Compares a password with a bcrypt hash.
   *
   * @param password - Plain text password
   * @param hash - Bcrypt hash
   */
  async compare(password: string, hash: Hash): Promise<boolean> {
    try {
      return await bcryptjs.compare(password, String(hash));
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err instanceof Error ? err : String(err),
        message: "Failed to compare password hash",
        metadata: {},
      });
    }
  }
}
