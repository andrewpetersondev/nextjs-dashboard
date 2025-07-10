import type { CustomerEntity } from "@/lib/db/entities/customer";
import type {
  CustomerByIdDbRow,
  CustomerId,
} from "@/lib/definitions/customers.types";
import type { CustomerDto } from "@/lib/dto/customer.dto";

/**
 * Brands a string as a CustomerId.
 * @param id - Customer ID as string
 * @returns Branded CustomerId
 */
export const toCustomerIdBrand = (id: string): CustomerId => id as CustomerId;

/**
 * Maps a database row to a CustomerEntity.
 * @param row - CustomerByIdDbRow
 * @returns CustomerEntity
 */
export function toCustomerEntity(row: CustomerByIdDbRow): CustomerEntity {
  return {
    email: row.email,
    id: toCustomerIdBrand(row.id),
    imageUrl: row.imageUrl,
    name: row.name,
  };
}

/**
 * Maps a CustomerEntity to a CustomerDto.
 * @param customer - CustomerEntity
 * @returns CustomerDto
 */
export function toCustomerDto(customer: CustomerEntity): CustomerDto {
  return {
    email: customer.email,
    id: customer.id as string, // strips brand for DTO
    imageUrl: customer.imageUrl,
    name: customer.name,
  };
}
