import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import type { AuthRole } from "@/shared/auth/types";
import { COLUMNS, commonFields, TABLES } from "./constants";
import { roleEnum } from "./users";

/**
 * Demo user counters: separate concerns from users table.
 */
export const demoUserCounters = pgTable(TABLES.DEMO_USER_COUNTERS, {
  count: integer(COLUMNS.COUNT).notNull().default(0),
  id: commonFields.id.serial(),
  role: roleEnum(COLUMNS.ROLE).notNull().default("guest").$type<AuthRole>(),
});

export const demoUserCountersRelations = relations(
  demoUserCounters,
  () => ({}),
);

export type DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;
