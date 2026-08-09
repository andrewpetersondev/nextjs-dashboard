import type { CustomerId } from "@database/schema/schema.types";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Customer records.
 *
 * `sensitiveData` is a deliberate demonstration of column-level exclusion: the
 * column exists and is `NOT NULL`, but no read path selects it and the domain
 * type omits it entirely. Leave it out of new queries.
 */
export const customers = pgTable("customers", {
	email: varchar("email", { length: 255 }).notNull().unique(),
	id: uuid("id").defaultRandom().primaryKey().$type<CustomerId>(),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	sensitiveData: varchar("sensitive_data", { length: 255 })
		.notNull()
		.default("cantTouchThis"),
});

/** A full row as selected, `sensitiveData` included — narrow it before it leaves the DAL. */
export type CustomerRow = typeof customers.$inferSelect;
