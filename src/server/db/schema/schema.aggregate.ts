import { customers } from "@/server/db/schema/customers";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { invoices } from "@/server/db/schema/invoices";
import { revenues } from "@/server/db/schema/revenues";
import { users } from "@/server/db/schema/users";

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
