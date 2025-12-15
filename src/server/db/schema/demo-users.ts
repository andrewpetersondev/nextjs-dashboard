import { relations } from "drizzle-orm";
import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import {
  GUEST_ROLE,
  type UserRole,
} from "@/modules/auth/shared/domain/user/auth.roles";
import { roleEnum } from "./users";

export const demoUserCounters = pgTable("demo_user_counters", {
  count: integer("count").notNull().default(0),
  id: serial("id").primaryKey(),
  role: roleEnum("role").notNull().default(GUEST_ROLE).$type<UserRole>(),
});

export const demoUserCountersRelations = relations(
  demoUserCounters,
  () => ({}),
);

export type DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;
