import { customers } from "./customers";
import { demoUserCounters } from "./demo-users";
import { invoices } from "./invoices";
import { revenues } from "./revenues";
import { users } from "./users";

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
