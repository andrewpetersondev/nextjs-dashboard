import { createCustomerId } from "@/modules/customers/domain/customer-id.factory";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";

/**
 * Validate and convert an arbitrary value into a branded `CustomerId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<CustomerId, AppError>` where `ok: true` contains the branded id,
 *          and `ok: false` contains an `AppError` describing the failure.
 *
 * @example
 * const r = toCustomerIdResult(someValue);
 * if (r.ok) { // use r.value }
 */
export const toCustomerIdResult = (
  value: unknown,
): Result<CustomerId, AppError> => createCustomerId(value);

/**
 * Validate and convert a string to a branded `CustomerId`.
 *
 * This is a thin throwing adapter over `toCustomerIdResult`. It throws the underlying `AppError`
 * when validation fails. Prefer the `Result`-returning converter in domain code; use this
 * adapter only at application boundaries.
 *
 * @param id - The input string to convert.
 * @returns The branded `CustomerId` when validation succeeds.
 * @throws {AppError} When validation fails.
 *
 * @example
 * try {
 *   const customerId = toCustomerId(req.params.id);
 * } catch (err) {
 *   // err is AppError
 * }
 */
export const toCustomerId = (id: string): CustomerId => {
  const r = toCustomerIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
