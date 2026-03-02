import "server-only";

import type { Hash } from "@/shared/primitives/hash/hash.brand";

export interface HashingContract {
  /**
   * Compares a raw string against a stored hash.
   */
  compare(raw: string, hash: Hash): Promise<boolean>;

  /**
   * Hashes a raw string.
   */
  hash(raw: string): Promise<Hash>;
}
