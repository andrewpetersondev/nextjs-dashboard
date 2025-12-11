import "server-only";
import { CryptoService } from "@/server/crypto/crypto.service";

/**
 * Factory to create a CryptoService instance.
 */
export function createCryptoService(): CryptoService {
  return new CryptoService();
}
