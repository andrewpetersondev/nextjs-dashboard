import {
  ValidationError,
  type ValidationError_New,
} from "@/shared/errors/domain";
import { Err, Ok, type Result } from "@/shared/result/result-base";

/**
 * Map a `ValidationError_New` to a legacy `ValidationError` within a Result.
 *
 * Shared-only implementation to avoid shared→server dependencies.
 *
 * @typeParam T - Type of the success data contained in the Result
 * @param r - Result containing either success data or `ValidationError_New`
 * @returns `Result<T, ValidationError>` with the error branch mapped, or the original success data
 */
export const mapNewToLegacyError = <T>(
  r: Result<T, ValidationError_New>,
): Result<T, ValidationError> =>
  r.success ? Ok(r.data) : Err(new ValidationError(r.error.message));
