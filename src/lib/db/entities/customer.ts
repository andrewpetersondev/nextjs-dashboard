import type { CustomerId } from "@/lib/definitions/customers.types";

export interface CustomerEntity {
	readonly id: CustomerId;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
}
