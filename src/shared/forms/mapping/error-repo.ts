import {
  assertAndFreezeDenseErrorMap,
  buildEmptyDenseErrorMap,
} from "@/shared/forms/mapping/error-utils";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors";

/**
 * Attach a single message to a chosen field (defaults to the first field),
 * returning a fully dense error map.
 */
export function attachRootDenseMessageToField<
  TField extends string,
  TMsg = string,
>(
  fields: readonly TField[],
  message: TMsg,
  opts?: { field?: TField },
): DenseFieldErrorMap<TField, TMsg> {
  const dense = buildEmptyDenseErrorMap<TField, TMsg>(fields);
  const target =
    opts?.field ?? (fields[0] as TField | undefined) ?? ("" as TField);
  // If fields list might be empty, fall back to returning the empty dense map.
  if (!target || !fields.includes(target)) {
    return dense;
  }
  return assertAndFreezeDenseErrorMap(fields, {
    ...dense,
    [target]: Object.freeze([message]) as readonly TMsg[],
  } as Record<TField, readonly TMsg[]>);
}

/**
 * Map an unknown repository/service error into a DenseErrorMap suitable for forms.
 *
 * Strategy:
 * - Prefer safe, user-facing message from known error types.
 * - Fall back to a generic message.
 * - Attach to the first field (or provided field) to keep UI wiring simple.
 */
export function mapRepoErrorToDenseFieldErrors<TField extends string>(
  error: unknown,
  fields: readonly TField[],
  opts?: {
    field?: TField;
    /**
     * Provide a function to extract a user-facing message from a known domain error.
     * If omitted, best-effort extraction is attempted.
     */
    toMessage?: (e: unknown) => string | undefined;
    /** Fallback message if nothing can be extracted. */
    defaultMessage?: string;
  },
): DenseFieldErrorMap<TField> {
  const defaultMsg =
    opts?.defaultMessage ?? "Operation failed. Please try again.";
  const extract =
    opts?.toMessage ??
    ((e: unknown) => {
      // Best-effort extraction without leaking internals.
      if (
        typeof e === "object" &&
        e &&
        "message" in e &&
        typeof (e as any).message === "string"
      ) {
        return (e as { message: string }).message;
      }
      return;
    });

  const msg = extract(error) ?? defaultMsg;
  return attachRootDenseMessageToField(fields, msg, { field: opts?.field });
}
