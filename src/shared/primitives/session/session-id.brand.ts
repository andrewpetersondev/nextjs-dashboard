import type { Brand } from "@/shared/core/branding/brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";
import { createIdFactory } from "@/shared/primitives/core/id/id.factory";

/**
 * Brand symbol for session identifiers.
 */
const SESSION_ID_BRAND: unique symbol = Symbol("SessionId");

/**
 * Branded session identifier (UUID string).
 */
type SessionId = Brand<string, typeof SESSION_ID_BRAND>;

/**
 * Creates a validated and branded SessionId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded SessionId or an AppError
 */
// biome-ignore lint/nursery/useExplicitType: fix
const createSessionId = createIdFactory<typeof SESSION_ID_BRAND, SessionId>(
	SESSION_ID_BRAND,
	"SessionId",
);

/**
 * Validate and convert an arbitrary value into a branded `SessionId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<SessionId, AppError>` representing success or an `AppError`.
 */
const _toSessionIdResult = (value: unknown): Result<SessionId, AppError> =>
	createSessionId(value);
