/**
 * Data Transfer Object (DTO) representing a customer entity.
 *
 * @remarks
 * - Used for transferring customer data between layers (API, services, etc.).
 * - All properties are immutable and strictly typed.
 *
 * @property email - Email address of the customer.
 * @property id - Unique identifier for the customer (UUID string).
 * @property imageUrl - URL to the customer's profile image.
 * @property name - Full name of the customer.
 *
 * @example
 * const customer: CustomerDto = {
 *   email: "jane.doe@example.com",
 *   id: "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
 *   imageUrl: "https://example.com/images/jane.jpg"
 *   name: "Jane Doe",
 * };
 */
export interface CustomerDto {
  readonly email: string;
  readonly id: string;
  readonly imageUrl: string;
  readonly name: string;
}
