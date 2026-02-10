import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import type { CustomerId } from "@/shared/branding/brands";

// biome-ignore lint/nursery/useExplicitType: fix
export const customers = pgTable("customers", {
  email: varchar("email", { length: 255 }).notNull().unique(),
  id: uuid("id").defaultRandom().primaryKey().$type<CustomerId>(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sensitiveData: varchar("sensitive_data", { length: 255 })
    .notNull()
    .default("cantTouchThis"),
});

export type CustomerRow = typeof customers.$inferSelect;
export type NewCustomerRow = typeof customers.$inferInsert;
