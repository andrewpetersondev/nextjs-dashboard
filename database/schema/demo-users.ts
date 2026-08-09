import { GUEST_ROLE, type UserRole } from "@database/schema/schema.constants";
import { userRolePgEnum } from "@database/schema/users";
import { integer, pgTable, serial } from "drizzle-orm/pg-core";

/**
 * One row per role, counting demo accounts created for it.
 *
 * Demo sign-ups mint real, permanent users, so this counter is what keeps their
 * generated names unique and bounded rather than growing without trace.
 */
export const demoUserCounters = pgTable("demo_user_counters", {
	count: integer("count").notNull().default(0),
	id: serial("id").primaryKey(),
	role: userRolePgEnum("role").notNull().default(GUEST_ROLE).$type<UserRole>(),
});
