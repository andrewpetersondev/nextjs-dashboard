/**
 * Computes a shallow difference between a base object and a candidate patch.
 *
 * Behavior:
 * - Only keys present in `patch` are considered.
 * - Keys with `undefined` values in `patch` are ignored (not included in the result).
 * - Comparison is shallow and uses strict inequality (`!==`).
 *   - Suitable for primitives (string, number, boolean).
 *   - Object/array/date references are compared by reference, not by deep equality.
 * - If a value in `patch` is different from `base`, that key/value is included in the returned object.
 *
 * Recommended usage:
 * - Prefer using with flat, primitive fields.
 * - Normalize inputs (e.g., trimming strings, lowercasing emails) before diffing to avoid noisy updates.
 *
 * @typeParam T - A record-like shape of comparable fields.
 * @param base - The source object to compare against.
 * @param patch - Candidate values to apply; only differing keys are returned.
 * @returns A partial object containing only keys whose values differ from `base`.
 */
// Shallow patch helper: returns only keys whose values differ from base
export function diffShallowPatch<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T>,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(patch) as Array<keyof T>) {
    const nextVal = patch[key];
    if (nextVal !== undefined && base[key] !== nextVal) {
      out[key] = nextVal;
    }
  }
  return out;
}
