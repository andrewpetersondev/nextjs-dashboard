import "server-only";
import { BcryptHashingAdapter } from "@/server/crypto/hashing/bcrypt-hashing.adapter";
import { HashingService } from "@/server/crypto/hashing/hashing.service";

/**
 * Factory to create a HashingService with default bcrypt adapter.
 */
export function createHashingService(): HashingService {
  return new HashingService(new BcryptHashingAdapter());
}
