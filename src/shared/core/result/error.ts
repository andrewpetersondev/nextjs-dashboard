/**
 * Lightweight error modeling primitives for the Result subsystem.
 * Keeps a narrow, serialization-safe contract independent of rich domain error classes.
 * Domain error modules should provide an adapter into AppError (do not import them here to avoid cycles).
 */

/** Internal constants for normalization defaults. */
const DEFAULT_UNKNOWN_KIND = "unknown" as const;
const DEFAULT_UNKNOWN_MESSAGE = "An unknown error occurred" as const;
const DEFAULT_UNKNOWN_SEVERITY: AppError["severity"] = "error";

/** Primitive constraint for error generics (see TypeScript instructions). */
export type ErrorLike = Error | { readonly message: string };

/**
 * Canonical application error shape used as the default error branch inside Result.
 * All fields must remain JSON-serializable; avoid functions / Symbols.
 */
export interface AppError {
  /** High-level category or domain (e.g. "validation", "io", "auth", "internal"). */
  readonly kind: string;
  /** Human-readable message (already redacted / safe for logs or end-user mapping). */
  readonly message: string;
  /** Stable machine-oriented code (maps to `error-codes.ts`). */
  readonly code?: string;
  /** Optional structured, redaction-safe detail payload. */
  readonly details?: unknown;
  /** Severity hint for logging or metrics routing. */
  readonly severity?: "info" | "warn" | "error";
  /** Standard JS Error name when available. */
  readonly name?: string;
  /** Stack trace (retain only for internal logging; strip before client exposure). */
  readonly stack?: string;
  /** Downstream cause chain (avoid leaking uncontrolled objects externally). */
  readonly cause?: unknown;
}

/**
 * Type guard to prevent double normalization.
 * @param value Arbitrary value to test.
 * @returns value is AppError
 */
export const isAppError = (value: unknown): value is AppError =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  typeof (value as { kind: unknown }).kind === "string" &&
  "message" in value &&
  typeof (value as { message: unknown }).message === "string";

/**
 * Normalize an unknown thrown/rejected value into an AppError.
 * Keeps minimal safe fields; richer domain metadata should be injected by an adapter layer above.
 * @param input Unknown error value.
 * @param overrides Optional partial metadata to override inferred values (kind, code, severity).
 * @returns AppError
 */
export const normalizeUnknownError = /* @__PURE__ */ (
  input: unknown,
  overrides?: {
    readonly kind?: string;
    readonly code?: string;
    readonly severity?: AppError["severity"];
  },
): AppError => {
  if (isAppError(input)) {
    // Merge only provided overrides (do not mutate original).
    return {
      ...input,
      code: overrides?.code ?? input.code,
      kind: overrides?.kind ?? input.kind,
      severity: overrides?.severity ?? input.severity,
    };
  }

  if (input instanceof Error) {
    return {
      // Preserve cause if present (ES2022 Error.cause); avoid spreading arbitrary enumerable props.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cause: (input as any).cause,
      code: overrides?.code,
      kind: overrides?.kind ?? DEFAULT_UNKNOWN_KIND,
      message: input.message || DEFAULT_UNKNOWN_MESSAGE,
      name: input.name,
      severity: overrides?.severity ?? DEFAULT_UNKNOWN_SEVERITY,
      stack: input.stack,
    };
  }

  if (
    typeof input === "object" &&
    input !== null &&
    "message" in input &&
    typeof (input as { message: unknown }).message === "string"
  ) {
    return {
      code: overrides?.code,
      kind: overrides?.kind ?? DEFAULT_UNKNOWN_KIND,
      message:
        (input as { message: string }).message || DEFAULT_UNKNOWN_MESSAGE,
      severity: overrides?.severity ?? DEFAULT_UNKNOWN_SEVERITY,
      // Intentionally omit arbitrary extra enumerable properties for safety.
    };
  }

  // Primitive or structurally unexpected object.
  return {
    code: overrides?.code,
    kind: overrides?.kind ?? DEFAULT_UNKNOWN_KIND,
    message:
      typeof input === "string" && input.trim().length > 0
        ? input
        : DEFAULT_UNKNOWN_MESSAGE,
    severity: overrides?.severity ?? DEFAULT_UNKNOWN_SEVERITY,
  };
};

/**
 * Create a shallowly augmented AppError from an existing one without mutation.
 * @param base Existing AppError (or unknown; will be normalized).
 * @param patch Partial fields to override/add (excluding message/kind safeguards).
 * @returns AppError
 */
export const augmentAppError = /* @__PURE__ */ (
  base: unknown,
  patch: Partial<Omit<AppError, "message" | "kind">> & {
    readonly message?: string;
    readonly kind?: string;
  },
): AppError => {
  const normalized = normalizeUnknownError(base);
  return {
    ...normalized,
    ...patch,
    // Ensure we never blank out required fields:
    kind: patch.kind ?? normalized.kind,
    message: patch.message ?? normalized.message,
  };
};
