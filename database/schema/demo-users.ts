import { GUEST_ROLE, type UserRole } from "@database/schema/schema.constants";
import { userRolePgEnum } from "@database/schema/users";
import { integer, pgTable, serial } from "drizzle-orm/pg-core";

export const demoUserCounters = pgTable("demo_user_counters", {
	count: integer("count").notNull().default(0),
	id: serial("id").primaryKey(),
	role: userRolePgEnum("role").notNull().default(GUEST_ROLE).$type<UserRole>(),
});

export type _DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type _NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;
