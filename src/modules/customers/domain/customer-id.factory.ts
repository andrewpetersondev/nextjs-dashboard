import {
  CUSTOMER_ID_BRAND,
  type CustomerId,
} from "@/modules/customers/domain/types/customer-id.brand";
import { createIdFactory } from "@/shared/branding/factories/id-factories";

/**
 * Creates a validated and branded CustomerId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded CustomerId or an AppError
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const createCustomerId = createIdFactory<
  typeof CUSTOMER_ID_BRAND,
  CustomerId
>(CUSTOMER_ID_BRAND, "CustomerId");
