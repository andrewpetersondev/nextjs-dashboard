/**
 * @file schema.ts
 * Drizzle ORM schema definitions for application tables, enums, and relations.
 *
 * Conventions:
 * - Monetary values stored as bigint cents.
 * - Timestamps use timestamptz for cross-timezone safety.
 * - Branded types constrain cross-table usage at compile time.
 */
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/types";
import { REVENUE_SOURCES, type RevenueSource } from "@/features/revenues/types";
import { USER_ROLES, type UserRole } from "@/features/users/types";
import type {
  CustomerId,
  InvoiceId,
  Period,
  RevenueId,
  SessionId,
  UserId,
} from "@/shared/brands/domain-brands";

/**
 * Schema overview
 * - Uses branded IDs (UserId, InvoiceId, etc.) to constrain cross-table usage at compile time.
 * - Represents money in integer cents for precision (no floating-point). Uses bigint to avoid overflow.
 * - Timestamps are stored as timestamptz for consistency across time zones.
 * - Check constraints enforce basic data invariants.
 * - Indexes are added for common joins/filters.
 */

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

// DB enums from domain constants to avoid duplication and drift
export const roleEnum = pgEnum(COLUMNS.ROLE, USER_ROLES);

export const statusEnum = pgEnum(COLUMNS.STATUS, INVOICE_STATUSES);

export const calculationSourceEnum = pgEnum(
  COLUMNS.CALCULATION_SOURCE,
  REVENUE_SOURCES,
);

/**
 * Common field builders for consistency.
 */
const commonFields = {
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
        .notNull(),
  },
} as const;

/**
 * Users: authentication and profile info.
 */
export const users = pgTable(TABLES.USERS, {
  email: commonFields.email(),
  id: commonFields.id.uuid().$type<UserId>(),
  password: varchar(COLUMNS.PASSWORD, { length: 255 }).notNull(),
  role: roleEnum(COLUMNS.ROLE).default("user").notNull().$type<UserRole>(),
  sensitiveData: commonFields.sensitiveData(),
  username: varchar(COLUMNS.USERNAME, { length: 50 }).notNull().unique(),
});

/**
 * Demo user counters: separate concerns from users table.
 */
export const demoUserCounters = pgTable(TABLES.DEMO_USER_COUNTERS, {
  count: integer(COLUMNS.COUNT).notNull().default(0),
  id: commonFields.id.serial(),
  role: roleEnum(COLUMNS.ROLE).notNull().default("guest").$type<UserRole>(),
});

/**
 * Customers: customer information for invoices.
 */
export const customers = pgTable(TABLES.CUSTOMERS, {
  email: commonFields.email(),
  id: commonFields.id.uuid().$type<CustomerId>(),
  imageUrl: varchar(COLUMNS.IMAGE_URL, { length: 255 }).notNull(),
  name: commonFields.name(),
  sensitiveData: commonFields.sensitiveData(),
});

/**
 * Revenues: monthly aggregates for reporting/analytics.
 * - period is the first day of the month (e.g., 2025-05-01).
 * - totalAmount is the sum of invoice amounts for that period (integer cents).
 *
 * Note: Defined before invoices to avoid forward-reference issues in pgTable column FKs.
 */
export const revenues = pgTable(
  TABLES.REVENUES,
  {
    calculationSource: calculationSourceEnum(COLUMNS.CALCULATION_SOURCE)
      .default("seed")
      .notNull()
      .$type<RevenueSource>(),
    createdAt: commonFields.timestamps.createdAt(),
    id: commonFields.id.uuid().$type<RevenueId>(),
    invoiceCount: integer(COLUMNS.INVOICE_COUNT).notNull().default(0),
    period: date(COLUMNS.PERIOD, { mode: "date" })
      .notNull()
      .unique()
      .$type<Period>(),
    // bigint to avoid overflow for large aggregates
    totalAmount: bigint(COLUMNS.TOTAL_AMOUNT, { mode: "number" })
      .notNull()
      .default(0),
    updatedAt: commonFields.timestamps.updatedAt(),
  },
  (table) => [
    // Ensure period is first-of-month
    check(
      "revenues_period_is_first_of_month",
      sql`extract(day from ${table.period}) = 1`,
    ),
    // Integrity: non-negative aggregates
    check("revenues_total_amount_non_negative", sql`${table.totalAmount} >= 0`),
    check(
      "revenues_invoice_count_non_negative",
      sql`${table.invoiceCount} >= 0`,
    ),
  ],
);

/**
 * Invoices: links customers to their invoices.
 * - revenuePeriod is the first day of the month this invoice contributes to.
 */
export const invoices = pgTable(
  TABLES.INVOICES,
  {
    // bigint cents to avoid overflow on large invoice amounts
    amount: bigint(COLUMNS.AMOUNT, { mode: "number" }).notNull(),
    customerId: uuid(COLUMNS.CUSTOMER_ID)
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" })
      .$type<CustomerId>(),
    date: date(COLUMNS.DATE, { mode: "date" }).notNull(),
    id: commonFields.id.uuid().$type<InvoiceId>(),
    revenuePeriod: date(COLUMNS.REVENUE_PERIOD, { mode: "date" })
      .notNull()
      .references(() => revenues.period, { onDelete: "restrict" })
      .$type<Period>(),
    sensitiveData: commonFields.sensitiveData(),
    status: statusEnum(COLUMNS.STATUS)
      .default("pending")
      .notNull()
      .$type<InvoiceStatus>(),
  },
  (table) => [
    // Integrity: amount must be non-negative
    check("invoices_amount_non_negative", sql`${table.amount} >= 0`),
    // Integrity: keep revenuePeriod aligned with date's month (first day)
    check(
      "invoices_revenue_period_matches_date",
      sql`${table.revenuePeriod} = date_trunc('month', ${table.date})::date`,
    ),
    // Performance: efficient joins/filters
    index("invoices_customer_id_idx").on(table.customerId),
    index("invoices_revenue_period_idx").on(table.revenuePeriod),
    // Helpful filter: by customer + status
    index("invoices_customer_id_status_idx").on(table.customerId, table.status),
  ],
);

/**
 * Sessions: manages user authentication sessions.
 * - expiresAt uses timestamptz and no default; application sets expiry.
 */
export const sessions = pgTable(
  TABLES.SESSIONS,
  {
    createdAt: commonFields.timestamps.createdAt(),
    expiresAt: commonFields.timestamps.expiresAt(),
    id: commonFields.id.uuid().$type<SessionId>(),
    token: text(COLUMNS.TOKEN).notNull().unique(),
    updatedAt: commonFields.timestamps.updatedAt(),
    userId: uuid(COLUMNS.USER_ID)
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .$type<UserId>(),
  },
  (table) => [
    // Performance: frequent lookups and cleanup tasks
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

/**
 * Relations for type-safe joins and queries.
 * Note: Drizzle may emit an informational warning when both FK constraints and relations are defined.
 * This is expected; the FK constraint will be used for relation mapping.
 */
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const demoUserCountersRelations = relations(
  demoUserCounters,
  () => ({}),
);

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  // Link invoice to its revenue month via first-of-month date
  revenue: one(revenues, {
    fields: [invoices.revenuePeriod], // invoices.revenue_period (DATE)
    references: [revenues.period], // revenues.period (DATE, unique, first-of-month)
  }),
}));

export const revenuesRelations = relations(revenues, ({ many }) => ({
  invoices: many(invoices),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

/**
 * Inferred row types for type safety.
 * These represent raw DB rows; branded IDs require validation before cross-entity use.
 */
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type CustomerRow = typeof customers.$inferSelect;
export type NewCustomerRow = typeof customers.$inferInsert;
export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;
export type RevenueRow = typeof revenues.$inferSelect;
export type NewRevenueRow = typeof revenues.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
export type DemoUserCounterRow = typeof demoUserCounters.$inferSelect;
export type NewDemoUserCounterRow = typeof demoUserCounters.$inferInsert;

/**
 * Union type for convenience in generic data-handling utilities.
 */
export type AnyTableRow =
  | UserRow
  | CustomerRow
  | InvoiceRow
  | RevenueRow
  | SessionRow
  | DemoUserCounterRow;

/**
 * Drizzle ORM relation warning (informational)
 * When both a foreign key constraint is defined in the table and a relation is specified via relations(),
 * Drizzle prints an informational warning and uses the FK for mapping. This is expected and safe to ignore.
 * Reference: https://orm.drizzle.team/docs/relations
 */
