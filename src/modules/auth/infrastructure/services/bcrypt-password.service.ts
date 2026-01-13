import "server-only";
import bcryptjs from "bcryptjs";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { Hash } from "@/shared/branding/brands";

const SALT_ROUNDS = 10 as const;

/**
 * Technical implementation of bcrypt hashing logic.
 */
export class BcryptPasswordService {
  async compare(password: string, hash: Hash): Promise<boolean> {
    return await bcryptjs.compare(password, String(hash));
  }

  async hash(password: string): Promise<Hash> {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    const hashed = await bcryptjs.hash(password, salt);
    return toHash(hashed);
  }
}
