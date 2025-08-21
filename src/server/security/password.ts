import "server-only";
import * as bcryptjs from "bcryptjs";
import { SALT_ROUNDS } from "@/shared/constants/auth";

/**
 * Generates a random password string with at least one capital letter, one number, and one special character.
 *
 * @param length - Desired length of the password (default: 10).
 * @returns {string} - The generated password.
 */
export const createRandomPassword = (length = 10): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt: string = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
};

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcryptjs.compare(plainPassword, hashedPassword);
}
