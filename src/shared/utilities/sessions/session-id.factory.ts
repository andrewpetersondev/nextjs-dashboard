import { createIdFactory } from "@/shared/utilities/ids/id.factory";
import {
  SESSION_ID_BRAND,
  type SessionId,
} from "@/shared/utilities/sessions/session-id.brand";

/**
 * Creates a validated and branded SessionId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded SessionId or an AppError
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const createSessionId = createIdFactory<
  typeof SESSION_ID_BRAND,
  SessionId
>(SESSION_ID_BRAND, "SessionId");
