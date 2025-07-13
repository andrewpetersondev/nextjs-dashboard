import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
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
import type {
  Brand,
  customerIdBrand,
  invoiceIdBrand,
  userIdBrand,
} from "@/lib/definitions/brands";

/**
 * Table and column name constants for maintainability.
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
  COUNT: "count",
  CUSTOMER_ID: "customer_id",
  DATE: "date",
  EMAIL: "email",
  EXPIRES_AT: "expires_at",
  ID: "id",
  IMAGE_URL: "image_url",
  MONTH: "month",
  NAME: "name",
  PASSWORD: "password",
  REVENUE: "revenue",
  ROLE: "role",
  SENSITIVE_DATA: "sensitive_data",
  STATUS: "status",
  TOKEN: "token",
  USER_ID: "user_id",
  USERNAME: "username",
} as const;

/**
 * Role enum for user roles.
 */
export const roleEnum = pgEnum("role", ["guest", "admin", "user"]);

/**
 * Status enum for invoice status.
 */
export const statusEnum = pgEnum("status", ["pending", "paid"]);

/**
 * Users table schema.
 * @see {User}
 */
export const users = pgTable(TABLES.USERS, {
  email: varchar(COLUMNS.EMAIL, { length: 50 }).notNull().unique(),
  id: uuid(COLUMNS.ID)
    .defaultRandom()
    .primaryKey()
    .$type<Brand<string, typeof userIdBrand>>(),
  password: varchar(COLUMNS.PASSWORD, { length: 255 }).notNull(),
  role: roleEnum(COLUMNS.ROLE).default("user").notNull(),
  sensitiveData: varchar(COLUMNS.SENSITIVE_DATA, { length: 50 })
    .notNull()
    .default("cantTouchThis"),
  username: varchar(COLUMNS.USERNAME, { length: 50 }).notNull(),
});

/**
 * Demo user counters table schema.
 * @see {DemoUserCounter}
 */
export const demoUserCounters = pgTable(TABLES.DEMO_USER_COUNTERS, {
  count: integer(COLUMNS.COUNT).notNull().default(0),
  id: serial(COLUMNS.ID).primaryKey(),
  role: roleEnum(COLUMNS.ROLE).notNull().default("guest"),
});

/**
 * Customers table schema.
 * @see {Customer}
 */
export const customers = pgTable(TABLES.CUSTOMERS, {
  email: varchar(COLUMNS.EMAIL, { length: 50 }).notNull().unique(),
  id: uuid(COLUMNS.ID)
    .defaultRandom()
    .primaryKey()
    .$type<Brand<string, typeof customerIdBrand>>(),
  imageUrl: varchar(COLUMNS.IMAGE_URL, { length: 255 }).notNull(),
  name: varchar(COLUMNS.NAME, { length: 50 }).notNull(),
  sensitiveData: varchar(COLUMNS.SENSITIVE_DATA, { length: 50 })
    .notNull()
    .default("cantTouchThis"),
});

/**
 * Invoices table schema.
 * @see {Invoice}
 */
export const invoices = pgTable(TABLES.INVOICES, {
  amount: integer(COLUMNS.AMOUNT).notNull(),
  customerId: uuid(COLUMNS.CUSTOMER_ID)
    .notNull()
    .references((): AnyPgColumn => customers.id)
    .$type<Brand<string, typeof customerIdBrand>>(), // <-- Use branded type
  date: date(COLUMNS.DATE).notNull(),
  id: uuid(COLUMNS.ID)
    .defaultRandom()
    .primaryKey()
    .$type<Brand<string, typeof invoiceIdBrand>>(),
  sensitiveData: varchar(COLUMNS.SENSITIVE_DATA, { length: 50 })
    .notNull()
    .default("cantTouchThis"),
  status: statusEnum(COLUMNS.STATUS).default("pending").notNull(),
});

/**
 * Revenues table schema.
 * @see {Revenue}
 */
export const revenues = pgTable(TABLES.REVENUES, {
  month: varchar(COLUMNS.MONTH, { length: 4 }).notNull().unique(),
  revenue: integer(COLUMNS.REVENUE).notNull(),
  sensitiveData: varchar(COLUMNS.SENSITIVE_DATA, { length: 50 })
    .notNull()
    .default("cantTouchThis"),
});

/**
 * Sessions table schema.
 * @see {Session}
 */
export const sessions = pgTable(TABLES.SESSIONS, {
  expiresAt: timestamp(COLUMNS.EXPIRES_AT).notNull(),
  id: uuid(COLUMNS.ID).defaultRandom().primaryKey(),
  token: text(COLUMNS.TOKEN).notNull(), // Enforce notNull for authentication
  userId: uuid(COLUMNS.USER_ID)
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

/**
 * User relations.
 */
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

/**
 * Demo user counters relations.
 */
export const demoUserCountersRelations = relations(
  demoUserCounters,
  () => ({}),
);

/**
 * Customer relations.
 *
 * Customers have many invoices.
 */
export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

/**
 * Invoice relations.
 *
 * Invoices belong to one customer.
 */
export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

/**
 * Revenue relations.
 */
export const revenuesRelations = relations(revenues, () => ({}));

/**
 * Session relations.
 *
 * Sessions belong to one user.
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

/**
 * Table row types for type safety and reusability.
 *
 * These types represent the raw rows from the database. They cannot easily swap with existing types because of branding, id, and date types.
 */
export type UserRawDrizzle = typeof users.$inferSelect;
export type NewUserRawDrizzle = typeof users.$inferInsert;
export type _DemoUserCounterRawDrizzle = typeof demoUserCounters.$inferSelect;
export type _NewDemoUserCounterRawDrizzle =
  typeof demoUserCounters.$inferInsert;
export type CustomerRawDrizzle = typeof customers.$inferSelect;
export type _NewCustomerRawDrizzle = typeof customers.$inferInsert;
export type InvoiceRawDrizzle = typeof invoices.$inferSelect;
export type NewInvoiceRawDrizzle = typeof invoices.$inferInsert;
export type RevenueRawDrizzle = typeof revenues.$inferSelect;
export type _NewRevenueRawDrizzle = typeof revenues.$inferInsert;
export type _SessionRawDrizzle = typeof sessions.$inferSelect;
export type _NewSessionRawDrizzle = typeof sessions.$inferInsert;

/**
 * ---------------------------------------------------------------------------
 * Drizzle ORM Relation Warning Documentation
 * ---------------------------------------------------------------------------
 *
 * When running Drizzle CLI or seeding the database, you may see warnings like:
 *
 *   "You are providing a one-to-many relation between the 'customers' and 'invoices' tables,
 *    while the 'invoices' table object already has foreign key constraint in the schema referencing 'customers' table.
 *    In this case, the foreign key constraint will be used."
 *
 * Cause:
 * - This warning occurs because both a foreign key constraint is defined in the table schema
 *   (e.g., `invoices.customerId.references(customers.id)`) and an explicit relation is defined
 *   using Drizzle's `relations()` function.
 *
 * Why it is Irrelevant:
 * - The warning is informational only. Drizzle will use the foreign key constraint for relation mapping.
 * - Defining both is not harmful and is considered best practice for type safety and advanced querying.
 * - No action is required; this does not affect runtime behavior or data integrity.
 *
 * Reference:
 * - https://orm.drizzle.team/docs/relations
 *
 * Safe to ignore for production and development.
 * ---------------------------------------------------------------------------
 */
