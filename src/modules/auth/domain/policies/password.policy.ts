/**
 * Generates a random password that complies with the shared password policy rules.
 *
 * Ensures presence of at least one letter, one number, and one special character,
 * and validates length using the shared policy constants.
 *
 * @param length - Desired password length. Must be between 5 and 20.
 * @returns A randomly generated compliant password string.
 * @throws Error if the length is outside the allowed range.
 *
 * @todo Confirm this will never fail.
 */
export const makeRandomPassword = (length = 10): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const specials = '!@#$%^&*(),.?":{}|<>';

  const all = uppercase + lowercase + digits + specials;

  const min: number = 5;
  const max: number = 20;

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
    const j = Math.floor(Math.random() * (i + 1));

    const a = seed[i];
    const b = seed[j];

    if (a === undefined || b === undefined) {
      // biome-ignore lint/nursery/noContinue: <it is fine>
      continue;
    }

    seed[i] = b;
    seed[j] = a;
  }

  return seed.join("");
};
