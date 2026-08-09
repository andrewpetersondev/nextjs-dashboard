import type { CustomerDto } from "@/modules/customers/application/dtos/customer.dto";
import type { CustomerEntity } from "@/modules/customers/domain/types";

/**
 * Maps a domain entity to the presentation-facing DTO.
 */
export function toCustomerDto(entity: CustomerEntity): CustomerDto {
	return {
		email: entity.email,
		id: entity.id,
		imageUrl: entity.imageUrl,
		name: entity.name,
	};
}
