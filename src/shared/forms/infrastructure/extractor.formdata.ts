/**
 * Extracts specified fields and their values from a FormData object.
 *
 * @param fd - The FormData object to extract fields from.
 * @param allowed - An array of allowed field names to pick.
 * @returns A readonly object containing the picked fields and their string values.
 */
export function extractFormDataFields<Tallowed extends string>(
  fd: FormData,
  allowed: readonly Tallowed[],
): Readonly<Partial<Record<Tallowed, string>>> {
  const out: Partial<Record<Tallowed, string>> = {};
  for (const k of allowed) {
    const v = fd.get(k);
    if (v !== null) {
      out[k] = typeof v === "string" ? v : String(v);
    }
  }
  return Object.freeze(out);
}
