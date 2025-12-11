import "server-only";
import type { HashingPort } from "@/server/crypto/hashing/hashing.port";
import type { Hash } from "@/server/crypto/hashing/hashing.types";

/**
 * Generic hashing service.
 * Delegates to a port for the actual algorithm.
 */
export class HashingService {
  private readonly hasher: HashingPort;

  constructor(hasher: HashingPort) {
    this.hasher = hasher;
  }

  async hash(raw: string): Promise<Hash> {
    return await this.hasher.hash(raw);
  }

  async compare(raw: string, hash: Hash): Promise<boolean> {
    return await this.hasher.compare(raw, hash);
  }
}
