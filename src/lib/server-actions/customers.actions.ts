import { fetchCustomers } from "@/src/lib/dal/customers.dal.ts";
import { getDB } from "@/src/lib/db/connection";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";

/**
 * Server action to read customers.
 */
export async function readCustomersAction(): Promise<CustomerField[]> {
	const db = getDB();
	const customers = await fetchCustomers(db);
	return customers;
}
