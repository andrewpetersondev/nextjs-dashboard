import type { CustomerId } from "@/src/lib/definitions/customers.types";

export interface CustomerEntity {
	readonly id: CustomerId;
	readonly name: string;
	readonly email: string;
	readonly imageUrl: string;
}
