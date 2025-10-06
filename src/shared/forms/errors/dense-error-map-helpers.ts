import {
  initializeDenseErrorMap,
  validateAndFreezeDenseMap,
} from "@/shared/forms/errors/dense-error-map";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";

/**
 * Attach a single message to a chosen field (defaults to the first field),
 * returning a fully dense error map.
 */
export function setDenseFieldErrorMessage<TField extends string, TMsg = string>(
  fields: readonly TField[],
  message: TMsg,
  opts?: { field?: TField },
): DenseFieldErrorMap<TField, TMsg> {
  const dense = initializeDenseErrorMap<TField, TMsg>(fields);
  const target =
    opts?.field ?? (fields[0] as TField | undefined) ?? ("" as TField);
  // If fields list might be empty, fall back to returning the empty dense map.
  if (!target || !fields.includes(target)) {
    return dense;
  }
  return validateAndFreezeDenseMap(fields, {
    ...dense,
    [target]: Object.freeze([message]) as readonly TMsg[],
  } as Record<TField, readonly TMsg[]>);
}
