import "server-only";
import type { Hash } from "@/server/crypto/hashing/hashing.value";

export interface HashingPort {
  /**
   * Compares a raw string against a stored hash.
   */
  compare(raw: string, hash: Hash): Promise<boolean>;

  /**
   * Hashes a raw string.
   */
  hash(raw: string): Promise<Hash>;
}
