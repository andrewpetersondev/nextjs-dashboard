/**
 * Generates a random password string with at least one capital letter, one number, and one special character.
 *
 * @param length - Desired length of the password (default: 10).
 * @returns {string} - The generated password.
 */
export const makeRandomPassword = (length = 10): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
