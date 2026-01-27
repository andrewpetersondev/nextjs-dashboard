import "server-only";
import bcryptjs from "bcryptjs";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { Hash } from "@/shared/branding/brands";

/**
 * Technical implementation of password hashing using bcrypt.
 *
 * This service provides low-level methods for hashing and comparing passwords
 * using the `bcryptjs` library.
 */
export class BcryptPasswordService {
  private readonly saltRounds: number;

  /**
   * Initializes the service with a specific number of salt rounds.
   *
   * @param saltRounds - The number of rounds to use for generating salts.
   */
  constructor(saltRounds: number) {
    this.saltRounds = saltRounds;
  }

  /**
   * Compares a plain-text password with a hash.
   *
   * @param password - The plain-text password to check.
   * @param hash - The hashed password to compare against.
   * @returns A promise that resolves to `true` if the password matches the hash, `false` otherwise.
   */
  async compare(password: string, hash: Hash): Promise<boolean> {
    return await bcryptjs.compare(password, String(hash));
  }

  /**
   * Hashes a plain-text password.
   *
   * @param password - The plain-text password to hash.
   * @returns A promise that resolves to the generated {@link Hash}.
   */
  async hash(password: string): Promise<Hash> {
    const salt = await bcryptjs.genSalt(this.saltRounds);
    const hashed = await bcryptjs.hash(password, salt);
    return toHash(hashed);
  }
}
