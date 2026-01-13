import "server-only";

import bcryptjs from "bcryptjs";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { Hash } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

const SALT_ROUNDS = 10 as const;

/**
 * Bcrypt-based implementation of the auth-specific PasswordHasherContract.
 *
 * ## Layering
 * This class belongs to the **infrastructure** layer as it wraps the
 * `bcryptjs` library.
 */
export class BcryptPasswordHasherAdapter implements PasswordHasherContract {
  /**
   * Hashes a password using bcrypt.
   *
   * @param password - Plain text password
   */
  async hash(password: string): Promise<Result<Hash, AppError>> {
    try {
      const salt = await bcryptjs.genSalt(SALT_ROUNDS);
      const hashed = await bcryptjs.hash(password, salt);
      return Ok(toHash(hashed));
    } catch (err) {
      return Err(
        makeAppError(APP_ERROR_KEYS.unexpected, {
          cause: err instanceof Error ? err : String(err),
          message: "Failed to hash password",
          metadata: {},
        }),
      );
    }
  }

  /**
   * Compares a password with a bcrypt hash.
   *
   * @param password - Plain text password
   * @param hash - Bcrypt hash
   */
  async compare(
    password: string,
    hash: Hash,
  ): Promise<Result<boolean, AppError>> {
    try {
      const match = await bcryptjs.compare(password, String(hash));
      return Ok(match);
    } catch (err) {
      return Err(
        makeAppError(APP_ERROR_KEYS.unexpected, {
          cause: err instanceof Error ? err : String(err),
          message: "Failed to compare password hash",
          metadata: {},
        }),
      );
    }
  }
}
