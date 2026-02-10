import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { roleEnum } from "@/server/db/schema/users";
import {
  GUEST_ROLE,
  type UserRole,
} from "@/shared/validation/user/user-role.schema";

// biome-ignore lint/nursery/useExplicitType: fix
export const demoUserCounters = pgTable("demo_user_counters", {
  count: integer("count").notNull().default(0),
  id: serial("id").primaryKey(),
  role: roleEnum("role").notNull().default(GUEST_ROLE).$type<UserRole>(),
});

export type DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;
