import "server-only";
import type { HashingContract } from "@/server/crypto/hashing/hashing.contract";

import type { Hash } from "@/shared/branding/brands";

/**
 * Generic hashing service.
 * Delegates to a port for the actual algorithm.
 */
export class HashingService {
  private readonly hasher: HashingContract;

  constructor(hasher: HashingContract) {
    this.hasher = hasher;
  }

  async hash(raw: string): Promise<Hash> {
    return await this.hasher.hash(raw);
  }

  async compare(raw: string, hash: Hash): Promise<boolean> {
    return await this.hasher.compare(raw, hash);
  }
}
