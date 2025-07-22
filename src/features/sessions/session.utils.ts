import "server-only";

import bcryptjs from "bcryptjs";
import { SALT_ROUNDS } from "@/lib/constants/auth.constants";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt: string = await bcryptjs.genSalt(SALT_ROUNDS);
    return await bcryptjs.hash(password, salt);
  } catch (error: unknown) {
    console.error("Error while hashing password:", error);
    throw error;
  }
};

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcryptjs.compare(plainPassword, hashedPassword);
}
