// For edit: treat empty strings as "not provided" so partial updates work.
// Helper: convert "" (or whitespace-only) to undefined
export const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;
