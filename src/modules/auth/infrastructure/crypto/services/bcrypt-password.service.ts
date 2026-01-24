import "server-only";
import bcryptjs from "bcryptjs";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { Hash } from "@/shared/branding/brands";

/**
 * Technical implementation of bcrypt hashing logic.
 */
export class BcryptPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number) {
    this.saltRounds = saltRounds;
  }

  async compare(password: string, hash: Hash): Promise<boolean> {
    return await bcryptjs.compare(password, String(hash));
  }

  async hash(password: string): Promise<Hash> {
    const salt = await bcryptjs.genSalt(this.saltRounds);
    const hashed = await bcryptjs.hash(password, salt);
    return toHash(hashed);
  }
}
