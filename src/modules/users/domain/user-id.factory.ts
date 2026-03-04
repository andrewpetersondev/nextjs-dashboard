import {
	USER_ID_BRAND,
	type UserId,
} from "@/modules/users/domain/types/user-id.brand";
import { createIdFactory } from "@/shared/primitives/core/id/id.factory";

/**
 * Creates a validated and branded UserId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded UserId or an AppError
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const createUserId = createIdFactory<typeof USER_ID_BRAND, UserId>(
	USER_ID_BRAND,
	"UserId",
);
