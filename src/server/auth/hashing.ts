import "server-only";

import bcryptjs from "bcryptjs";
import { SALT_ROUNDS } from "@/server/auth/constants";

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
