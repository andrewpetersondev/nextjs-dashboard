import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  AnyPgColumn,
  integer,
  date,
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
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references((): AnyPgColumn => customers.id),
  amount: integer("amount").notNull(),
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
  month: varchar({ length: 4 }).notNull().unique(),
  revenue: integer().notNull(),
});