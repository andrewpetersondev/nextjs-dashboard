import {
	REVENUE_ID_BRAND,
	type RevenueId,
} from "@/modules/revenues/domain/types/revenue-id.brand";
import { createIdFactory } from "@/shared/primitives/core/id/id.factory";

/**
 * Creates a validated and branded RevenueId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded RevenueId or an AppError
 */
export const createRevenueId = createIdFactory<
	typeof REVENUE_ID_BRAND,
	RevenueId
>(REVENUE_ID_BRAND, "RevenueId");
