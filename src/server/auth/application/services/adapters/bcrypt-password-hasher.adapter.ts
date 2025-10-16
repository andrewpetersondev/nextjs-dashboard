import "server-only";
import bcryptjs from "bcryptjs";
import {
  asPasswordHash,
  type PasswordHash,
} from "@/server/auth/domain/types/password.types";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { SALT_ROUNDS } from "@/server/auth/session/constants";

const genSalt = async (rounds: number): Promise<string> =>
  bcryptjs.genSalt(rounds);
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

export class CryptoPasswordHasher implements PasswordHasher {
  async hash(raw: string): Promise<PasswordHash> {
    const hashed = await hashPassword(raw);
    return asPasswordHash(hashed);
  }
  async compare(raw: string, hash: PasswordHash): Promise<boolean> {
    return await comparePassword(raw, hash as string);
  }
}
