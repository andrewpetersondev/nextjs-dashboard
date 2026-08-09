/**
 * Makes any value safe to log — never throws.
 *
 * @returns The value unchanged when already serializable; a lossless conversion
 * (`bigint`→string, `Date`→ISO, `Error`→plain object); or a
 * `{ note, originalType, preview }` descriptor when neither is possible.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <ignore for now>
export function redactNonSerializable(value: unknown): unknown {
	if (value === null || value === undefined) {
		return value;
	}

	const type = typeof value;
	if (type === "string" || type === "number" || type === "boolean") {
		return value;
	}

	if (type === "bigint") {
		return (value as bigint).toString();
	}

	if (value instanceof Error) {
		return {
			message: value.message,
			name: value.name,
			// Avoid stack traces in production for security and payload size
			stack:
				// biome-ignore lint/correctness/noProcessGlobal: <ignore for now>
				// biome-ignore lint/style/noProcessEnv: <ignore for now>
				typeof process !== "undefined" && process.env.NODE_ENV === "development"
					? value.stack
					: undefined,
		};
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	// Fast path: value is JSON-serializable → return as-is
	try {
		JSON.stringify(value, (_key, v) =>
			typeof v === "bigint" ? v.toString() : v,
		);
		return value;
	} catch {
		// Fall through to redaction below
	}

	// Nullish values already returned above, so only array-vs-typeof remains.
	const originalType: string = Array.isArray(value) ? "array" : typeof value;

	let preview: string;
	try {
		preview = JSON.stringify(value);
	} catch {
		try {
			preview = String(value);
		} catch {
			preview = "[uninspectable value]";
		}
	}

	const MaxLength = 500;
	if (preview.length > MaxLength) {
		preview = `${preview.slice(0, MaxLength)}…[truncated ${
			preview.length - MaxLength
		} chars]`;
	}

	return {
		note: "non-serializable",
		originalType,
		preview,
	};
}
