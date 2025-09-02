import { serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Common field builders for consistency.
 */
export const commonFields = {
  email: () => varchar("email", { length: 255 }).notNull().unique(),

  id: {
    // Primary keys do not need unique() (PK implies uniqueness)
    serial: () => serial("id").primaryKey(),

    uuid: () => uuid("id").defaultRandom().primaryKey(),
  },

  name: () => varchar("name", { length: 255 }).notNull(),

  sensitiveData: () =>
    varchar("sensitive_data", { length: 255 })
      .notNull()
      .default("cantTouchThis"),

  timestamps: {
    // Use timestamptz for safer cross-timezone handling
    createdAt: () =>
      timestamp("created_at", { mode: "date", withTimezone: true })
        .defaultNow()
        .notNull(),

    // Sessions set their own expiry; no default here on purpose
    expiresAt: () =>
      timestamp("expires_at", {
        mode: "date",
        withTimezone: true,
      }).notNull(),

    updatedAt: () =>
      timestamp("updated_at", { mode: "date", withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
  },
} as const;
