/**
 * Represents a revenue entity in the database, defining the structure and properties of a revenue record.
 *  - **Best Practices:**
 *    - All fields are readonly to prevent accidental mutations.
 *    - Use branded types for IDs to ensure type safety.
 */
export interface RevenueEntity {
  readonly revenue: number;
  readonly month: string;
  readonly sensitiveData: string;
}
