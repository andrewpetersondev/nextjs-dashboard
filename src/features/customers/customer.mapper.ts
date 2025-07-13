import type { CustomerEntity } from "@/db/models/customer.entity";
import type { CustomerRawDrizzle } from "@/db/schema";
import type { CustomerDto } from "@/features/customers/customer.dto";
import { toCustomerId } from "@/lib/definitions/brands";

/**
 * Transforms a raw database row (from Drizzle ORM) into a strongly-typed `CustomerEntity`.
 *
 * - Enforces domain invariants and applies defensive branding.
 * - Validates primitive types at runtime; branding is compile-time only.
 * - Throws if required fields are missing or invalid.
 *
 * @param row - Raw customer row from the database (may be branded by Drizzle).
 * @returns {CustomerEntity} - The domain entity with enforced invariants and branding.
 * @throws {Error} - If required fields are missing or invalid.
 *
 * @example
 * const entity = toCustomerEntity(dbRow);
 *
 */
export function toCustomerEntity(row: CustomerRawDrizzle): CustomerEntity {
  // Defensive: Validate all required fields
  if (
    !row ||
    typeof row.email !== "string" ||
    typeof row.id !== "string" ||
    typeof row.imageUrl !== "string" ||
    typeof row.sensitiveData !== "string" ||
    typeof row.name !== "string"
  ) {
    throw new Error("Invalid customer row: missing required fields");
  }
  // Defensive: Apply branding even though the properties are already branded in the DB schema
  return {
    email: row.email,
    id: toCustomerId(row.id), // Defensive
    imageUrl: row.imageUrl,
    name: row.name,
    sensitiveData: row.sensitiveData, // Sensitive data should not be exposed in DTOs
  };
}

/**
 * Maps a CustomerEntity to a CustomerDto for transport to the client/UI.
 *
 * - Strips branded types to plain type for serialization.
 * - Use this function when sending customer data to external consumers.
 * - Defensively converts all properties to plain types.
 *
 * @param customer - The domain entity to convert.
 * @return {CustomerDto} - The DTO with plain types.
 *
 * @example
 * const dto = toCustomerDto(customer);
 *
 */
export function toCustomerDto(customer: CustomerEntity): CustomerDto {
  return {
    email: String(customer.email),
    id: String(customer.id),
    imageUrl: String(customer.imageUrl),
    name: String(customer.name),
  };
}
