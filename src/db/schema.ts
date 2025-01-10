import * as p from "drizzle-orm/pg-core";

export const users = p.pgTable("users", {
  id: p.uuid().defaultRandom().primaryKey(),
  username: p.varchar({ length: 255 }).notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  password: p.varchar({ length: 255 }).notNull(),
});

export const customers = p.pgTable("customers", {
  id: p.uuid().defaultRandom().primaryKey(),
  name: p.varchar({ length: 255 }).notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  image_url: p.varchar({ length: 255 }).notNull(),
});

export const paymentStatusEnum = p.pgEnum("paymentStatus", ["pending", "paid"]);

export const invoices = p.pgTable("invoices", {
  id: p.uuid().defaultRandom().primaryKey(),
  customer_id: p
    .uuid()
    .notNull()
    .references((): p.AnyPgColumn => customers.id),
  amount: p.integer().notNull(),
  paymentStatus: paymentStatusEnum().default("pending"),
  date: p.date().notNull(),
});

export const revenue = p.pgTable("revenue", {
  month: p.varchar({ length: 4 }).notNull().unique(),
  revenue: p.integer().notNull(),
});