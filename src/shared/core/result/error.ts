// src/shared/core/result/error.ts
/**
 * Lightweight error modeling primitives for the Result subsystem.
 * Provides a narrow, JSON‑safe `AppError` plus normalization helpers.
 */

/** @internal Default classification for unknown errors. */
const DEFAULT_UNKNOWN_KIND = "unknown" as const;
/** @internal Default user-safe fallback message. */
const DEFAULT_UNKNOWN_MESSAGE = "An unknown error occurred" as const;
/** @internal Default severity applied to unknown errors. */
const DEFAULT_UNKNOWN_SEVERITY: AppError["severity"] = "error";

/**
 * Primitive constraint for error generics.
 */
export type ErrorLike = Error | { readonly message: string };

/**
 * Canonical application error shape (JSON-serializable).
 */
export interface AppError {
  readonly kind: string;
  readonly message: string;
  readonly code?: string;
  readonly details?: unknown;
  readonly severity?: "info" | "warn" | "error";
  readonly name?: string;
  readonly stack?: string;
  readonly cause?: unknown;
}

/**
 * Overrides accepted during unknown error normalization.
 */
export interface NormalizeUnknownErrorOverrides {
  readonly kind?: string;
  readonly code?: string;
  readonly severity?: AppError["severity"];
}

/**
 * Patch contract for augmenting an existing (or unknown) error.
 * `kind` and `message` allowed but safeguarded to never become empty.
 */
export type AugmentAppErrorPatch = Partial<
  Omit<AppError, "kind" | "message">
> & {
  readonly kind?: string;
  readonly message?: string;
};

/**
 * Structural guard—intentionally shallow. Does not validate optional field types beyond `kind` and `message`.
 * @param value Arbitrary value to test.
 * @returns true if shape matches minimal AppError surface.
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
 * Precedence:
 * 1. Existing AppError: shallow override of selected fields.
 * 2. Native Error instance: mapped core fields (name, message, stack, cause).
 * 3. Object with string message.
 * 4. Primitive fallback (string used directly if non-empty).
 * Drops extraneous enumerable properties for safety.
 * @param input Unknown error value.
 * @param overrides Optional classification overrides.
 * @returns AppError (never throws).
 */
export const normalizeUnknownError = /* @__PURE__ */ (
  input: unknown,
  overrides?: NormalizeUnknownErrorOverrides,
): AppError => {
  if (isAppError(input)) {
    return {
      ...input,
      code: overrides?.code ?? input.code,
      kind: overrides?.kind ?? input.kind,
      severity: overrides?.severity ?? input.severity,
    };
  }

  if (input instanceof Error) {
    return {
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
    };
  }

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
 * Create an augmented AppError from any input (normalizes first, then overlays patch).
 * Safeguards required fields from becoming empty.
 * @param base Input error (unknown).
 * @param patch Partial override additions.
 * @returns AppError
 */
export const augmentAppError = /* @__PURE__ */ (
  base: unknown,
  patch: AugmentAppErrorPatch,
): AppError => {
  const normalized = normalizeUnknownError(base);
  return {
    ...normalized,
    ...patch,
    kind: patch.kind ?? normalized.kind,
    message: patch.message ?? normalized.message,
  };
};
