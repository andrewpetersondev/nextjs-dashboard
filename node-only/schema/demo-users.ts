import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import type { AuthRole } from "../../src/shared/auth/types";
import { commonFields } from "./constants";
import { roleEnum } from "./users";

/**
 * Demo user counters: separate concerns from users table.
 */
export const demoUserCounters = pgTable("demo_user_counters", {
  count: integer("count").notNull().default(0),
  id: commonFields.id.serial(),
  role: roleEnum("role").notNull().default("guest").$type<AuthRole>(),
});

export const demoUserCountersRelations = relations(
  demoUserCounters,
  () => ({}),
);

export type DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;
