import { serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Common field builders for consistency.
 */
export const commonFields = {
  email: () => varchar(COLUMNS.EMAIL, { length: 255 }).notNull().unique(),

  id: {
    // Primary keys do not need unique() (PK implies uniqueness)
    serial: () => serial(COLUMNS.ID).primaryKey(),

    uuid: () => uuid(COLUMNS.ID).defaultRandom().primaryKey(),
  },

  name: () => varchar(COLUMNS.NAME, { length: 255 }).notNull(),

  sensitiveData: () =>
    varchar(COLUMNS.SENSITIVE_DATA, { length: 255 })
      .notNull()
      .default("cantTouchThis"),

  timestamps: {
    // Use timestamptz for safer cross-timezone handling
    createdAt: () =>
      timestamp(COLUMNS.CREATED_AT, { mode: "date", withTimezone: true })
        .defaultNow()
        .notNull(),

    // Sessions set their own expiry; no default here on purpose
    expiresAt: () =>
      timestamp(COLUMNS.EXPIRES_AT, {
        mode: "date",
        withTimezone: true,
      }).notNull(),

    updatedAt: () =>
      timestamp(COLUMNS.UPDATED_AT, { mode: "date", withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
  },
} as const;

/**
 * Constants for DB table and column names to prevent typos and ease refactors.
 */
export const TABLES = {
  CUSTOMERS: "customers",
  DEMO_USER_COUNTERS: "demo_user_counters",
  INVOICES: "invoices",
  REVENUES: "revenues",
  SESSIONS: "sessions",
  USERS: "users",
} as const;

export const COLUMNS = {
  AMOUNT: "amount",
  CALCULATION_SOURCE: "calculation_source",
  COUNT: "count",
  CREATED_AT: "created_at",
  CUSTOMER_ID: "customer_id",
  DATE: "date",
  EMAIL: "email",
  EXPIRES_AT: "expires_at",
  ID: "id",
  IMAGE_URL: "image_url",
  INVOICE_COUNT: "invoice_count",
  NAME: "name",
  PASSWORD: "password",
  PERIOD: "period",
  REVENUE: "revenue", // kept for compatibility; not used in this file
  REVENUE_PERIOD: "revenue_period",
  ROLE: "role",
  SENSITIVE_DATA: "sensitive_data",
  STATUS: "status",
  TOKEN: "token",
  TOTAL_AMOUNT: "total_amount",
  UPDATED_AT: "updated_at",
  USER_ID: "user_id",
  USERNAME: "username",
} as const;
