/**
 * Type guard for primitives allowed in error details.
 * @param v - Value to check.
 * @returns True if value is string, number, or boolean.
 */
export function isErrorDetailPrimitive(
  v: unknown,
): v is string | number | boolean {
  return (
    typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
}
