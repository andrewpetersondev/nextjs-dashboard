import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { GUEST_ROLE, type UserRole } from "./schema.constants.js";
import { userRolePgEnum } from "./users.js";

// biome-ignore lint/nursery/useExplicitType: Drizzle schema tables rely on inference for precise column types.
export const demoUserCounters = pgTable("demo_user_counters", {
	count: integer("count").notNull().default(0),
	id: serial("id").primaryKey(),
	role: userRolePgEnum("role").notNull().default(GUEST_ROLE).$type<UserRole>(),
});

export type _DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type _NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;
