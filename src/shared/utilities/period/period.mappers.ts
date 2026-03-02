import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";
import type { Period } from "@/shared/utilities/period/period.brand";
import { createPeriod } from "@/shared/utilities/period/period.factory";

/**
 * Normalize and validate an input into a branded `Period`.
 *
 * Accepts `Date | string` input in the factory; the result indicates success or an `AppError`.
 *
 * @param value - The input value to normalize and validate.
 * @returns A `Result<Period, AppError>` representing success or an `AppError`.
 */
export const toPeriodResult = (value: unknown): Result<Period, AppError> =>
  createPeriod(value);

/**
 * Normalize an input into a branded `Period`.
 *
 * This throwing adapter wraps `toPeriodResult`. It accepts `Date | string` and throws an `AppError`
 * when normalization/validation fails.
 *
 * @param input - The input `Date` or `string` to normalize.
 * @returns The branded `Period` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export function toPeriod(input: Date | string): Period {
  const r = toPeriodResult(input);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}
