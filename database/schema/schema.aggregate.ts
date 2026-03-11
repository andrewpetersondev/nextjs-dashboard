import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { invoices } from "@database/schema/invoices";
import { revenues } from "@database/schema/revenues";
import { users } from "@database/schema/users";

/**
 * Combined schema object for drizzle() initialization.
 * Import this in db.connection.ts.
 */
export const schema = {
	customers,
	demoUserCounters,
	invoices,
	revenues,
	users,
} as const;
