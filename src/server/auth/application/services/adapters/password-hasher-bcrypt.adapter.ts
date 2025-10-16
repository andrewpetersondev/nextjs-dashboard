import "server-only";
import bcryptjs from "bcryptjs";
import {
  asPasswordHash,
  type PasswordHash,
} from "@/server/auth/domain/types/password.types";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { SALT_ROUNDS } from "@/server/auth/session/session.constants";

const genSalt = async (rounds: number): Promise<string> =>
  bcryptjs.genSalt(rounds);

export const hashWithSaltRounds = async (password: string): Promise<string> => {
  const salt = await genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

export async function compareHash(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(raw: string): Promise<PasswordHash> {
    const hashed = await hashWithSaltRounds(raw);
    return asPasswordHash(hashed);
  }
  async compare(raw: string, hash: PasswordHash): Promise<boolean> {
    // avoid unsafe cast by unboxing via asPasswordHash then String()
    return await compareHash(raw, String(asPasswordHash(hash)));
  }
}
