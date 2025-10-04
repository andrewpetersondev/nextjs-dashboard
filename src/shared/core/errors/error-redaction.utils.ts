import {
  EMAIL_REGEX,
  PARTIAL_MASK_MIN_LENGTH,
  PARTIAL_MASK_VISIBLE_EMAIL_CHARS,
  PARTIAL_MASK_VISIBLE_END_CHARS,
  PARTIAL_MASK_VISIBLE_START_CHARS,
} from "@/shared/core/errors/error-redaction.constants";

/**
 * Builds the sensitive key set (case-insensitive).
 */
export function buildSensitiveSet(
  base: readonly string[],
  extra: readonly string[],
): Set<string> {
  return new Set([...base, ...extra].map((k) => k.toLowerCase()));
}

/**
 * Decide if a key is sensitive.
 */
export function isSensitiveKey(sensitive: Set<string>, key?: string): boolean {
  if (!key) {
    return false;
  }
  return sensitive.has(key.toLowerCase());
}

/**
 * Apply masking rules to a string value.
 */
export function applyMask(
  value: string,
  mask: string,
  partial: boolean,
  _keyHint?: string,
): string {
  if (!partial) {
    return mask;
  }
  if (isEmail(value)) {
    const [user, domain] = value.split("@");
    if (!user || !domain) {
      return mask;
    }
    const visible = user.slice(0, PARTIAL_MASK_VISIBLE_EMAIL_CHARS);
    return `${visible}***@${domain}`;
  }
  if (value.length > PARTIAL_MASK_MIN_LENGTH) {
    return `${value.slice(0, PARTIAL_MASK_VISIBLE_START_CHARS)}***${value.slice(-PARTIAL_MASK_VISIBLE_END_CHARS)}`;
  }
  return mask;
}

/**
 * Checks if a string is a valid email address.
 * @param v - The string to validate.
 * @returns True if the string matches the email pattern, false otherwise.
 */
export function isEmail(v: string): boolean {
  return EMAIL_REGEX.test(v);
}
