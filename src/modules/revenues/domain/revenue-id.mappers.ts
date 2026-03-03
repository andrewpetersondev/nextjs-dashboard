import { createRevenueId } from "@/modules/revenues/domain/factories/revenue-id.factory";
import type { RevenueId } from "@/modules/revenues/domain/types/revenue-id.brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Validate and convert an arbitrary value into a branded `RevenueId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<RevenueId, AppError>` representing success or an `AppError`.
 */
const toRevenueIdResult = (value: unknown): Result<RevenueId, AppError> =>
  createRevenueId(value);

/**
 * Validate and convert a string to a branded `RevenueId`.
 *
 * @param id - The input string to convert.
 * @returns The branded `RevenueId` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export const toRevenueId = (id: string): RevenueId => {
  const r = toRevenueIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
