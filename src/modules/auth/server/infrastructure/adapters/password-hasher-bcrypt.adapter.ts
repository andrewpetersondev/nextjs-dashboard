import "server-only";
import bcryptjs from "bcryptjs";
import {
  asPasswordHash,
  type PasswordHash,
} from "@/modules/auth/domain/password.types";
import type { PasswordHasherPort } from "@/modules/auth/server/application/ports/password-hasher.port";
import { SALT_ROUNDS } from "@/modules/auth/server/domain/session/constants";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

const genSalt = async (rounds: number): Promise<string> =>
  bcryptjs.genSalt(rounds);

/**
 * Hashes a password with configured salt rounds.
 * Exported for legacy compatibility - prefer using BcryptPasswordHasherAdapter instead.
 */
export const hashWithSaltRounds = async (password: string): Promise<string> => {
  const salt = await genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

/**
 * Compares a plain password with a hashed password.
 * Exported for legacy compatibility - prefer using BcryptPasswordHasherAdapter instead.
 */
export async function compareHash(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

/**
 * Bcrypt-based password hashing adapter.
 * Implements secure password hashing using bcryptjs with configurable salt rounds.
 *
 * Features:
 * - Uses 10 salt rounds (SALT_ROUNDS constant)
 * - Normalizes all bcrypt errors to AppError with "encryption" code
 * - Provides consistent error handling across hash and compare operations
 */
export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  async hash(raw: string): Promise<PasswordHash> {
    try {
      const hashed = await hashWithSaltRounds(raw);
      return asPasswordHash(hashed);
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err,
        message: "Failed to hash password",
        metadata: { cryptoOperation: "hash", operation: "hash" },
      });
    }
  }

  async compare(raw: string, hash: PasswordHash): Promise<boolean> {
    try {
      return await compareHash(raw, String(hash));
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err,
        message: "Failed to compare password hash",
        metadata: { cryptoOperation: "compare", operation: "compare" },
      });
    }
  }
}
