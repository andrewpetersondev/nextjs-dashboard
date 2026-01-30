/**
 * Generates a random password that complies with the shared password policy rules.
 *
 * Ensures presence of at least one letter, one number, and one special character.
 *
 * @param length - Desired password length. Must be an integer between 5 and 20.
 * @returns A randomly generated compliant password string.
 * @throws Error if the length is not a safe integer or is outside the allowed range.
 */
export function makeRandomPassword(length: number): string {
  const uppercase: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase: string = "abcdefghijklmnopqrstuvwxyz";
  const digits: string = "0123456789";
  const specials: string = '!@#$%^&*(),.?":{}|<>';

  const all: string = uppercase + lowercase + digits + specials;

  const min: number = 5;
  const max: number = 20;

  if (!Number.isSafeInteger(length)) {
    throw new Error("Password length must be a safe integer.");
  }

  if (length < min || length > max) {
    throw new Error(
      `Password length must be between ${min} and ${max} characters.`,
    );
  }

  const pick = (source: string): string =>
    source.charAt(Math.floor(Math.random() * source.length));

  // Seed with required character classes.
  const seed: string[] = [
    pick(uppercase + lowercase), // letter
    pick(digits), // number
    pick(specials), // special
  ];

  // Fill remaining characters.
  for (let i = seed.length; i < length; i++) {
    seed.push(pick(all));
  }

  // Fisher-Yates shuffle for randomness distribution.
  for (let i = seed.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    const a: string = seed[i] as string;
    const b: string = seed[j] as string;

    seed[i] = b;
    seed[j] = a;
  }

  return seed.join("");
}
