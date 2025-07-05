import { fetchCustomers } from "@/src/lib/dal/customers.dal";
import { getDB } from "@/src/lib/db/connection";
import type { CustomerField } from "@/src/lib/definitions/customers.types";

/**
 * Server action to read customers.
 * @returns Array of customer fields
 */
export async function readCustomersAction(): Promise<CustomerField[]> {
	const db = getDB();
	return fetchCustomers(db);
}
