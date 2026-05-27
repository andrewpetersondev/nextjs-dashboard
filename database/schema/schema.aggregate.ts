import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { invoices } from "@database/schema/invoices";
import { users } from "@database/schema/users";

/**
 * Combined schema object for drizzle() initialization.
 * Import this in db.connection.ts.
 */
export const schema = {
	customers,
	demoUserCounters,
	invoices,
	users,
} as const;
