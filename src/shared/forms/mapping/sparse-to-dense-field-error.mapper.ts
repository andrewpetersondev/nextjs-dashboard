import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";

/**
 * @deprecated Use `toDenseFieldErrorMapFromSparse` from errors/dense-error-map instead.
 */
export function mapSparseToDenseFieldError<TField extends string>(
  fields: readonly TField[],
  sparse: Partial<Record<TField, readonly string[]>>,
): DenseFieldErrorMap<TField> {
  const result = Object.create(null) as Record<TField, readonly string[]>;

  for (const key of fields) {
    const value = sparse[key] ?? [];
    result[key] = value;
  }

  return result as DenseFieldErrorMap<TField>;
}
