import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { InvoiceStatus } from "@/features/invoices/invoice.types";
import { INVOICE_STATUSES } from "@/features/invoices/invoice.types";
import {
  REVENUE_SOURCES,
  type RevenueSource,
} from "@/features/revenues/core/revenue.types";
import type { UserRole } from "@/features/users/user.types";
import { USER_ROLES } from "@/features/users/user.types";
import type {
  CustomerId,
  InvoiceId,
  Period,
  RevenueId,
  SessionId,
  UserId,
} from "@/lib/definitions/brands";

/**
 * Database table and column name constants for maintainability and consistency.
 * These constants help prevent typos and make refactoring easier.
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
  REVENUE: "revenue",
  ROLE: "role",
  SENSITIVE_DATA: "sensitive_data",
  STATUS: "status",
  TOKEN: "token",
  UPDATED_AT: "updated_at",
  USER_ID: "user_id",
  USERNAME: "username",
} as const;

// Build DB enums from domain constants to avoid duplication and drift
export const roleEnum = pgEnum(COLUMNS.ROLE, USER_ROLES);

export const statusEnum = pgEnum(COLUMNS.STATUS, INVOICE_STATUSES);

export const calculationSourceEnum = pgEnum(
  COLUMNS.CALCULATION_SOURCE,
  REVENUE_SOURCES,
);

/**
 * Common field configurations for reusability and consistency.
 */
const commonFields = {
  email: () => varchar(COLUMNS.EMAIL, { length: 255 }).notNull().unique(),
  id: {
    serial: () => serial(COLUMNS.ID).primaryKey(),
    uuid: () => uuid(COLUMNS.ID).defaultRandom().primaryKey(),
  },
  name: () => varchar(COLUMNS.NAME, { length: 255 }).notNull(),
  sensitiveData: () =>
    varchar(COLUMNS.SENSITIVE_DATA, { length: 255 })
      .notNull()
      .default("cantTouchThis"),
  timestamps: {
    createdAt: () => timestamp(COLUMNS.CREATED_AT).defaultNow().notNull(),
    updatedAt: () => timestamp(COLUMNS.UPDATED_AT).defaultNow().notNull(),
  },
} as const;

/**
 * Users table schema with a branded UserId type.
 * Stores user authentication and profile information.
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
 * Demo user counters table schema for tracking demo usage.
 * Separate table to avoid polluting the main users table.
 */
export const demoUserCounters = pgTable(TABLES.DEMO_USER_COUNTERS, {
  count: integer(COLUMNS.COUNT).notNull().default(0),
  id: commonFields.id.serial(),
  role: roleEnum(COLUMNS.ROLE).notNull().default("guest").$type<UserRole>(),
});

/**
 * Customers table schema with a branded CustomerId type.
 * Stores customer information for invoice management.
 */
export const customers = pgTable(TABLES.CUSTOMERS, {
  email: commonFields.email(),
  id: commonFields.id.uuid().$type<CustomerId>(),
  imageUrl: varchar(COLUMNS.IMAGE_URL, { length: 255 }).notNull(),
  name: commonFields.name(),
  sensitiveData: commonFields.sensitiveData(),
});

/**
 * Invoices table schema with branded InvoiceId and CustomerId types.
 * Links customers to their invoices with proper foreign key relationships.
 */
export const invoices = pgTable(TABLES.INVOICES, {
  amount: integer(COLUMNS.AMOUNT).notNull(),
  customerId: uuid(COLUMNS.CUSTOMER_ID)
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" })
    .$type<CustomerId>(),
  date: date(COLUMNS.DATE).notNull(),
  id: commonFields.id.uuid().$type<InvoiceId>(),
  sensitiveData: commonFields.sensitiveData(),
  status: statusEnum(COLUMNS.STATUS)
    .default("pending")
    .notNull()
    .$type<InvoiceStatus>(),
});

/**
 * Revenues table schema for monthly revenue tracking.
 * Aggregated data for reporting and analytics with audit trail and metadata.
 */
export const revenues = pgTable(TABLES.REVENUES, {
  // Backed by pgEnum from REVENUE_SOURCES to keep DB and domain in sync.
  calculationSource: calculationSourceEnum(COLUMNS.CALCULATION_SOURCE)
    .default("seed")
    .notNull()
    .$type<RevenueSource>(),
  createdAt: commonFields.timestamps.createdAt(),
  id: commonFields.id.uuid().$type<RevenueId>(),
  invoiceCount: integer(COLUMNS.INVOICE_COUNT).notNull().default(0),
  period: varchar(COLUMNS.PERIOD, { length: 7 })
    .notNull()
    .unique()
    .$type<Period>(), // Format: YYYY-MM
  revenue: integer(COLUMNS.REVENUE).notNull(),
  updatedAt: commonFields.timestamps.updatedAt(),
});

/**
 * Sessions table schema with branded SessionId and UserId types.
 * Manages user authentication sessions with automatic cleanup.
 */
export const sessions = pgTable(TABLES.SESSIONS, {
  createdAt: commonFields.timestamps.createdAt(),
  expiresAt: timestamp(COLUMNS.EXPIRES_AT).notNull(),
  id: commonFields.id.uuid().$type<SessionId>(),
  token: text(COLUMNS.TOKEN).notNull().unique(),
  updatedAt: commonFields.timestamps.updatedAt(),
  userId: uuid(COLUMNS.USER_ID)
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .$type<UserId>(),
});

/**
 * Table relations for type-safe joins and queries.
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
}));

export const revenuesRelations = relations(revenues, () => ({}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

/**
 * Inferred types from the Drizzle schema for type safety.
 * These represent the raw database rows and should be used with caution
 * due to branded types that require validation before use.
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
 * Union types for easier type checking and validation.
 */
export type AnyTableRow =
  | UserRow
  | CustomerRow
  | InvoiceRow
  | RevenueRow
  | SessionRow
  | DemoUserCounterRow;

/**
 * ---------------------------------------------------------------------------
 * Drizzle ORM Relation Warning Documentation
 * ---------------------------------------------------------------------------
 *
 * When running Drizzle CLI or seeding the database, you may see warnings like:
 *
 *   "You are providing a one-to-many relation between the 'customers' and 'invoices' tables,
 *    while the 'invoices' table object already has a foreign key constraint in the schema referencing 'customers' table.
 *    In this case, the foreign key constraint will be used."
 *
 * Cause:
 * - This warning occurs because both a foreign key constraint is defined in the table schema
 *   (e.g., `invoices.customerId.references(customers.id)`) and an explicit relation is defined
 *   using Drizzle's `relations()` function.
 *
 * Why it is Irrelevant:
 * - The warning is informational only. Drizzle will use the foreign key constraint for relation mapping.
 * - Defining both is not harmful and is considered the best practice for type safety and advanced querying.
 * - No action is required; this does not affect runtime behavior or data integrity.
 *
 * Reference:
 * - https://orm.drizzle.team/docs/relations
 *
 * Safe to ignore for production and development.
 * ---------------------------------------------------------------------------
 */
