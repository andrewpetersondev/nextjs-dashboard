import "server-only";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { Hash } from "@/server/crypto/hashing/hashing.types";

/**
 * Generic crypto service composing hashing, signing, etc.
 */
export class CryptoService {
  private readonly hashing: ReturnType<typeof createHashingService>;

  constructor() {
    this.hashing = createHashingService();
  }

  // Hashing methods (delegates to HashingService)
  async hash(raw: string): Promise<Hash> {
    return await this.hashing.hash(raw);
  }

  async compare(raw: string, hash: Hash): Promise<boolean> {
    return await this.hashing.compare(raw, hash);
  }

  // Placeholder for signing (e.g., JWT) - expand as needed
  async sign(
    payload: Record<string, unknown>,
    secret: string,
  ): Promise<string> {
    // Implement signing logic (e.g., using jose or crypto)
    throw new Error("Signing not implemented yet");
  }
}
