import "server-only";
import bcryptjs from "bcryptjs";
import type { HashingPort } from "@/server/crypto/hashing/hashing.port";
import { asHash, type Hash } from "@/server/crypto/hashing/hashing.types";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

const SALT_ROUNDS = 10 as const;

const genSalt = async (rounds: number): Promise<string> =>
  bcryptjs.genSalt(rounds);

/**
 * Bcrypt-based hashing adapter.
 */
export class BcryptHashingAdapter implements HashingPort {
  async hash(raw: string): Promise<Hash> {
    try {
      const salt = await genSalt(SALT_ROUNDS);
      const hashed = await bcryptjs.hash(raw, salt);
      return asHash(hashed);
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err,
        message: "Failed to hash value",
        metadata: { cryptoOperation: "hash" },
      });
    }
  }

  async compare(raw: string, hash: Hash): Promise<boolean> {
    try {
      return await bcryptjs.compare(raw, String(hash));
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: err,
        message: "Failed to compare hash",
        metadata: { cryptoOperation: "compare" },
      });
    }
  }
}
