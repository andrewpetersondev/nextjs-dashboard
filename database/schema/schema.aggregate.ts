import { customers } from "./customers.js";
import { demoUserCounters } from "./demo-users.js";
import { invoices } from "./invoices.js";
import { revenues } from "./revenues.js";
import { users } from "./users.js";

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
