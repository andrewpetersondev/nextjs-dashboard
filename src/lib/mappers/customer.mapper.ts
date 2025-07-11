import type { CustomerEntity } from "@/lib/db/entities/customer";
import { toCustomerId } from "@/lib/definitions/brands";
import type { CustomerByIdDbRow } from "@/lib/definitions/customers.types";
import type { CustomerDto } from "@/lib/dto/customer.dto";

/**
 * Maps a database row to a CustomerEntity.
 * Ensures ID is branded for type safety.
 */
export function toCustomerEntity(row: CustomerByIdDbRow): CustomerEntity {
  return {
    email: row.email,
    id: toCustomerId(row.id), // Brand the ID
    imageUrl: row.imageUrl,
    name: row.name,
  };
}

/**
 * Maps a CustomerEntity to a CustomerDto.
 * Strips brand from ID for transport.
 */
export function toCustomerDto(customer: CustomerEntity): CustomerDto {
  return {
    email: customer.email,
    id: customer.id as string, // Strip brand for DTO
    imageUrl: customer.imageUrl,
    name: customer.name,
  };
}
