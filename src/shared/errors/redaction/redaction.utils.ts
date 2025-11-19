import {
  DEFAULT_MASK,
  EMAIL_REGEX,
  PARTIAL_MASK_MIN_LENGTH,
  PARTIAL_MASK_VISIBLE_EMAIL_CHARS,
  PARTIAL_MASK_VISIBLE_END_CHARS,
  PARTIAL_MASK_VISIBLE_START_CHARS,
} from "@/shared/errors/redaction/redaction.constants";

let SeenCache = new WeakMap<object, unknown>();

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
 * Check if a key should be redacted.
 */
export function shouldRedactKey(
  key: string,
  sensitiveKeys: readonly string[],
): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some((k) => k.toLowerCase() === lowerKey);
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
    if (!(user && domain)) {
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

export function deepCloneWithRedaction(
  obj: unknown,
  sensitiveKeys: readonly string[],
  depth: number,
  maxDepth: number,
): unknown {
  if (depth > maxDepth) {
    return "[Max Depth Reached]";
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Check cache to prevent infinite loops and improve performance
  if (SeenCache.has(obj as object)) {
    return SeenCache.get(obj as object);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const result = obj.map((item) =>
      deepCloneWithRedaction(item, sensitiveKeys, depth + 1, maxDepth),
    );
    SeenCache.set(obj, result);
    return result;
  }

  // Handle objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = shouldRedactKey(key, sensitiveKeys)
      ? DEFAULT_MASK
      : deepCloneWithRedaction(value, sensitiveKeys, depth + 1, maxDepth);
  }

  SeenCache.set(obj, result);
  return result;
}

// Clear cache periodically or expose as utility
export function clearRedactionCache(): void {
  SeenCache = new WeakMap();
}
