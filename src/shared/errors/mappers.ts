import type { ValidationError } from "@/shared/errors/domain";
import { Err, Ok, type Result } from "@/shared/result/result-base";

/**
 * Map a `ValidationError_New` to a legacy `ValidationError` within a Result.
 *
 * Deprecated: The legacy ValidationError has been removed. This mapper now
 * simply returns the original Result, mapping the error branch to the new type.
 *
 * @typeParam T - Type of the success data contained in the Result
 * @param r - Result containing either success data or `ValidationError_New`
 * @returns `Result<T, ValidationError_New>` with the error branch mapped (no-op)
 */
export const mapNewToLegacyError = <T>(
  r: Result<T, ValidationError>,
): Result<T, ValidationError> => (r.success ? Ok(r.data) : Err(r.error));
