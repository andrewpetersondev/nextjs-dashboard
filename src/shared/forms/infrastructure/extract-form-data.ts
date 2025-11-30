/**
 * Extracts specified fields and their values from a FormData object.
 *
 * @param fd - The FormData object to extract fields from.
 * @param allowed - An array of allowed field names to pick.
 * @returns A readonly object containing the picked fields and their string values.
 */
export function extractFormDataFields<T extends string>(
  fd: FormData,
  allowed: readonly T[],
): Readonly<Partial<Record<T, string>>> {
  const out: Partial<Record<T, string>> = {};
  for (const k of allowed) {
    const v = fd.get(k);
    if (v !== null) {
      out[k] = typeof v === "string" ? v : String(v);
    }
  }
  return Object.freeze(out);
}
