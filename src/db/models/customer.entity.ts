import type { CustomerId } from "@/lib/definitions/brands";

/**
 * Represents a customer entity in the database, defining the structure and properties of a customer record.
 *  - **Best Practices:**
 *    - All fields are readonly to prevent accidental mutations.
 *    - Use branded types for IDs to ensure type safety.
 */
export interface CustomerEntity {
  readonly id: CustomerId;
  readonly name: string;
  readonly email: string;
  readonly imageUrl: string;
  readonly sensitiveData: string;
}
