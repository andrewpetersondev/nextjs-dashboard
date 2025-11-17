/**
 * @file Utilities to safely read rows from node-postgres/drizzle execute results.
 * These helpers avoid use of `any` by operating on `unknown` and narrowing via type guards.
 */

/**
 * A minimal shape for a pg/drizzle result carrying rows.
 * @template TRow - The row type contained in the result.
 */
export interface PgRows<Trow extends object> {
  /** The rows returned by the query. */
  readonly rows: readonly Trow[];
}

/**
 * Type guard to determine whether a value looks like a Pg result with rows.
 * @param value - Unknown value to test.
 * @returns True if the value has an array `rows` property.
 */
export function hasRows<Trow extends object>(
  value: unknown,
): value is PgRows<Trow> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  // Using a temporary typed view to avoid `any`.
  const candidate = value as { readonly rows?: unknown };
  return Array.isArray(candidate.rows);
}

/**
 * Return first row if present and shaped as TRow, otherwise null.
 * @param value - Unknown result to extract the first row from.
 */
export function firstRow<Trow extends object>(value: unknown): Trow | null {
  if (!hasRows<Trow>(value)) {
    return null;
  }
  const [row] = value.rows as readonly Trow[];
  return row ?? null;
}
