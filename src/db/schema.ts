import {
  integer,
  pgTable,
  varchar,
  text,
  uuid,
  date,
} from "drizzle-orm/pg-core";

// drizzle example
export const people = pgTable("people", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  customer_id: uuid("customer_id").notNull(),
  amount: integer().notNull(),
  status: varchar({ length: 255 }).notNull(),
  date: date().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
});

export const revenue = pgTable("revenue", {
  month: varchar({ length: 4 }).notNull().unique(),
  revenue: integer().notNull(),
});