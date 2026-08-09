/** Resolved redaction settings, after defaults and `extraKeys` have been folded in. */
export interface InternalConfig {
	/** Replacement text substituted for a sensitive value. */
	readonly mask: string;
	/** Recursion limit; structures deeper than this are truncated rather than walked. */
	readonly maxDepth: number;
	/** Mask part of the value instead of all of it, keeping a hint for debugging. */
	readonly partialMask: boolean;
	/** Lowercased key names whose values are masked wherever they appear. */
	readonly sensitive: Set<string>;
}

/**
 * One frame of the array walk.
 *
 * `walker` is passed in rather than imported to break the cycle between the
 * array and object helpers, which recurse into each other. `seen` is shared
 * across the whole traversal so a circular reference terminates.
 */
export interface ArrayRedactOptions {
	arr: unknown[];
	cfg: InternalConfig;
	depth: number;
	seen: WeakSet<object>;
	walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

/** One frame of the object walk — the object-shaped counterpart to {@link ArrayRedactOptions}. */
export interface ObjectRedactOptions {
	cfg: InternalConfig;
	depth: number;
	obj: Record<string, unknown>;
	seen: WeakSet<object>;
	walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

/** Caller-facing options, before resolution into an {@link InternalConfig}. */
export interface RedactOptions {
	/** Key names to treat as sensitive on top of the built-in set. */
	readonly extraKeys: readonly string[];
	readonly mask: string;
	readonly maxDepth: number;
	readonly partialMask: boolean;
}
