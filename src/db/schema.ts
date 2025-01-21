import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  AnyPgColumn,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  username: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 50 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const customers = pgTable("customers", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 50 }).notNull().unique(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export const statusEnum = pgEnum("status", ["pending", "paid"]);

export const invoices = pgTable("invoices", {
  id: uuid().defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references((): AnyPgColumn => customers.id),
  amount: integer().notNull(),
  status: statusEnum().default("pending"),
  date: date().notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customers: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const revenues = pgTable("revenues", {
  // id: uuid().defaultRandom().primaryKey(),
  month: varchar({ length: 4 }).notNull().unique(),
  revenue: integer().notNull(),
});

export const databaseSessions = pgTable("database_sessions", {
  id: uuid().defaultRandom().primaryKey(),
  sessionToken: varchar("session_token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references((): AnyPgColumn => users.id),
});

export const databaseSessionsRelations = relations(
  databaseSessions,
  ({ one }) => ({
    users: one(users, {
      fields: [databaseSessions.userId],
      references: [users.id],
    }),
  }),
);