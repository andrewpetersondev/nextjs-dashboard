import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import { createUserId } from "@/modules/users/domain/user-id.factory";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";

/**
 * Validate and convert an arbitrary value into a branded `UserId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<UserId, AppError>` representing success or an `AppError`.
 */
export const toUserIdResult = (value: unknown): Result<UserId, AppError> =>
  createUserId(value);
/**
 * Validate and convert a string to a branded `UserId`.
 *
 * @param id - The input string to convert.
 * @returns The branded `UserId` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export const toUserId = (id: string): UserId => {
  const r = toUserIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
