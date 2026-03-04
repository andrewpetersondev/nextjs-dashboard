/**
 * @file Universal env mapping helper.
 *
 * @remarks
 * - Intentionally does NOT touch `process.env` directly.
 * - A caller provides the resolver function (server-only, test, or other runtime).
 */
export function mapEnvVars<const T extends Record<string, string>>(
	mapping: T,
	resolve: (envKey: T[keyof T]) => string,
): Readonly<{ [K in keyof T]: string }> {
	const entries = Object.entries(mapping).map(([camelKey, envKey]) => {
		return [camelKey, resolve(envKey as T[keyof T])];
	});

	return Object.freeze(Object.fromEntries(entries)) as Readonly<{
		[K in keyof T]: string;
	}>;
}
