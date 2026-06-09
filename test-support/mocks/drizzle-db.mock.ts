import type { AppDatabase } from "@/server/db/db.connection";

/** A chainable, awaitable stand-in for a Drizzle select query builder. */
type QueryChain = Promise<readonly unknown[]> & Record<string, unknown>;

/**
 * Minimal chainable stand-in for a Drizzle select query builder.
 *
 * The returned object is a real Promise that resolves to `rows`, with every
 * builder method (`select`, `from`, `where`, joins, `orderBy`, `limit`,
 * `offset`, …) attached as a no-op that returns the same object. So
 * `await db.select(...).from(...)....offset(...)` resolves to `rows` no matter
 * which builder methods a DAL calls — letting unit tests exercise the JS logic
 * around a single read query (guards, mapping, pagination math) with no live
 * database.
 *
 * Single-query reads only: the whole chain resolves to the same `rows`.
 */
export function makeReadQueryDb(rows: readonly unknown[]): AppDatabase {
	const chain = Promise.resolve(rows) as QueryChain;

	const methods = [
		"select",
		"from",
		"where",
		"innerJoin",
		"leftJoin",
		"rightJoin",
		"orderBy",
		"groupBy",
		"having",
		"limit",
		"offset",
	] as const;

	for (const method of methods) {
		chain[method] = (): QueryChain => chain;
	}

	return chain as unknown as AppDatabase;
}
