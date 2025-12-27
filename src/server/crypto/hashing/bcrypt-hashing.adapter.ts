import "server-only";

import bcryptjs from "bcryptjs";
import type { HashingPort } from "@/server/crypto/hashing/hashing.port";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { Hash } from "@/shared/branding/brands";
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
      return toHash(hashed);
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: Error.isError(err) ? err : "fix this ",
        message: "Failed to hash value",
        metadata: {},
      });
    }
  }

  async compare(raw: string, hash: Hash): Promise<boolean> {
    try {
      return await bcryptjs.compare(raw, String(hash));
    } catch (err) {
      throw makeAppError("infrastructure", {
        cause: Error.isError(err) ? err : "fix this ",
        message: "Failed to compare hash",
        metadata: {},
      });
    }
  }
}
