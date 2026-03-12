/**
 * A minimal shape for a pg/drizzle result carrying rows.
 */
interface PgRows<Trow extends object> {
	readonly rows: readonly Trow[];
}

/**
 * Type guard to determine whether a value looks like a Pg result with rows.
 */
function hasRows<Trow extends object>(value: unknown): value is PgRows<Trow> {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const candidate = value as { readonly rows?: unknown };
	return Array.isArray(candidate.rows);
}

/**
 * Return first row if present and shaped as TRow, otherwise null.
 */
export function firstRow<Trow extends object>(value: unknown): Trow | null {
	if (!hasRows<Trow>(value)) {
		return null;
	}

	const [row] = value.rows as readonly Trow[];
	return row ?? null;
}
