import "server-only";
import bcryptjs from "bcryptjs";
import {
  asPasswordHash,
  type PasswordHash,
} from "@/modules/auth/domain/password/password.types";
import { SALT_ROUNDS } from "@/modules/auth/domain/sessions/session.constants";
import type { PasswordHasherPort } from "@/modules/auth/server/application/ports/password-hasher.port";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

const genSalt = async (rounds: number): Promise<string> =>
  bcryptjs.genSalt(rounds);

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
      const salt = await genSalt(SALT_ROUNDS);
      const hashed = await bcryptjs.hash(raw, salt);
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
      return await bcryptjs.compare(raw, String(hash));
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err,
        message: "Failed to compare password hash",
        metadata: { cryptoOperation: "compare", operation: "compare" },
      });
    }
  }
}
