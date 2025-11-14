import { ValidationError } from "@/shared/core/errors/domain/base-error.subclasses";

/**
 * Validation rule for parameters.
 * Encapsulates a validation function and an associated error message.
 * @typeParam V - Type of value to validate.
 * @property validate - Function to check if the value passes the rule.
 * @property message - Error message to display if the rule fails.
 */
export type ParamRule<V> = {
  validate: (value: V) => boolean;
  message: string;
};

/**
 * Defines validation rules for a subset of object properties.
 * Accepts a record type `T` and keys `K` from `T` to map each selected property
 * to a validation rule of type {@link ParamRule}.
 * @typeParam T - The object type being validated.
 * @typeParam K - Keys of the object `T` that require validations.
 * @remarks
 * Each key in `K` maps to a {@link ParamRule} corresponding to the value type of
 * that key in `T`.
 */
export type ParamValidators<
  T extends Record<string, unknown>,
  K extends keyof T,
> = {
  [P in K]: ParamRule<T[P]>;
};

/**
 * Assert that provided parameters meet specified validation rules.
 * Iterates over the given validators and checks each parameter against its
 * corresponding rule. Throws a `ValidationError` if a parameter fails validation.
 * @typeParam T - Type representing the overall structure of the parameters.
 * @typeParam K - Keys of `T` which are validated.
 * @param params - Object containing the parameters to validate.
 * @param validators - Object where keys match `params` keys and values define
 * validation rules for the corresponding parameter.
 * @returns void - Throws an error if validation fails; otherwise, no return value.
 * @remarks
 * - At least one validator must be provided in the `validators` object.
 * - Throws `ValidationError` if a parameter fails its respective validation rule.
 */
export function assertParams<
  T extends Record<string, unknown>,
  K extends keyof T & string,
>(params: T, validators: ParamValidators<T, K>): void {
  // Ensure at least one validator is provided
  if (Object.keys(validators).length === 0) {
    throw new ValidationError("No validators provided", { params });
  }

  // Iterate defined validators; no non-null assertion needed
  for (const [key, rule] of Object.entries(validators) as [
    K,
    ParamRule<T[K]>,
  ][]) {
    const value = params[key];
    if (!rule.validate(value)) {
      throw new ValidationError(rule.message, { param: key, value });
    }
  }
}
