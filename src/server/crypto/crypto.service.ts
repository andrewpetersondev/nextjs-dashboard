import "server-only";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { Hash } from "@/server/crypto/hashing/hashing.value";

/**
 * Small facade over shared crypto capabilities.
 *
 * @remarks
 * Keep this minimal. Add methods only when you have at least two consumers.
 */
export class CryptoService {
  private readonly hashing = createHashingService();

  async compare(raw: string, hash: Hash): Promise<boolean> {
    return await this.hashing.compare(raw, hash);
  }

  async hash(raw: string): Promise<Hash> {
    return await this.hashing.hash(raw);
  }
}
