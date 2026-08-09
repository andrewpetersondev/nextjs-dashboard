import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";

/**
 * The stable boundary shape between the application layer and presentation.
 *
 * Domain entities never leave the application boundary — actions and forms see
 * this, never `CustomerEntity`.
 */
export type CustomerDto = {
	readonly id: CustomerId;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
};
