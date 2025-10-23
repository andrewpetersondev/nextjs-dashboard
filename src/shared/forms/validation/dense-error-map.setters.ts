import type { DenseFieldErrorMap } from "@/shared/forms/errors/types/dense.types";
import {
  createEmptyDenseFieldErrorMap,
  normalizeAndFreezeDenseFieldErrorMap,
} from "@/shared/forms/validation/dense-error-map";

/**
 * Create a dense error map with a single message set on a chosen field (defaults to first).
 */
export function setSingleFieldErrorMessage<
  TField extends string,
  TMsg extends string = string,
>(
  fields: readonly TField[],
  message: TMsg,
  opts?: { field?: TField },
): DenseFieldErrorMap<TField, TMsg> {
  const dense = createEmptyDenseFieldErrorMap<TField, TMsg>(fields);
  const target = opts?.field ?? (fields[0] as TField | undefined);

  if (!target || !fields.includes(target)) {
    return dense;
  }

  const draft = {
    ...dense,
    [target]: Object.freeze([message]) as readonly TMsg[],
  } as Record<TField, readonly TMsg[]>;

  return normalizeAndFreezeDenseFieldErrorMap(fields, draft);
}
