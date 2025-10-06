import {
  createEmptyDenseFieldErrorMap,
  normalizeAndFreezeDenseFieldErrorMap,
} from "@/shared/forms/errors/dense-error-map";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";

/**
 * Create a dense error map with a single message set on a chosen field (defaults to first).
 */
export function setSingleFieldErrorMessage<
  TField extends string,
  TMsg = string,
>(
  fields: readonly TField[],
  message: TMsg,
  opts?: { field?: TField },
): DenseFieldErrorMap<TField, TMsg> {
  const dense = createEmptyDenseFieldErrorMap<TField, TMsg>(fields);
  const target =
    opts?.field ?? (fields[0] as TField | undefined) ?? ("" as TField);

  if (!target || !fields.includes(target)) {
    return dense;
  }

  return normalizeAndFreezeDenseFieldErrorMap(fields, {
    ...dense,
    [target]: Object.freeze([message]) as readonly TMsg[],
  } as Record<TField, readonly TMsg[]>);
}
