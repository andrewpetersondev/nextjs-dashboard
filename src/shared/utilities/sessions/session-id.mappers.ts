import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";
import type { SessionId } from "@/shared/utilities/sessions/session-id.brand";
import { createSessionId } from "@/shared/utilities/sessions/session-id.factory";

/**
 * Validate and convert an arbitrary value into a branded `SessionId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<SessionId, AppError>` representing success or an `AppError`.
 */
export const toSessionIdResult = (
  value: unknown,
): Result<SessionId, AppError> => createSessionId(value);
