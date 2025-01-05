import * as p from "drizzle-orm/pg-core";
import * as drizzle from "drizzle-orm";

// drizzle example
export const people = p.pgTable("people", {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.varchar({ length: 255 }).notNull(),
  age: p.integer().notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
});

export const users = p.pgTable("users", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  name: p.varchar({ length: 255 }).notNull(),
  email: p.text("email").notNull().unique(),
  password: p.text("password").notNull(),
});

export const invoices = p.pgTable("invoices", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  customer_id: p.uuid("customer_id").notNull(),
  amount: p.integer().notNull(),
  status: p.varchar({ length: 255 }).notNull(),
  date: p.date().notNull(),
});

export const customers = p.pgTable("customers", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  name: p.varchar({ length: 255 }).notNull(),
  email: p.text("email").notNull().unique(),
});

export const revenue = p.pgTable("revenue", {
  month: p.varchar({ length: 4 }).notNull().unique(),
  revenue: p.integer().notNull(),
});