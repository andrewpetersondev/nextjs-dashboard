import "server-only";

import bcryptjs from "bcryptjs";

import { SALT_ROUNDS } from "@/shared/auth/constants";

export const hashPassword = async (password: string): Promise<string> => {
  const salt: string = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}
