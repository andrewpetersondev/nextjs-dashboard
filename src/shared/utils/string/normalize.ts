// For edit: treat empty strings as "not provided" so partial updates work.
// Helper: convert "" (or whitespace-only) to undefined
export const toUndefinedIfEmptyString = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;
