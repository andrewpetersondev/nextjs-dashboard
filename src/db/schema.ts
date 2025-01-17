import * as p from "drizzle-orm/pg-core";
import * as orm from "drizzle-orm";

export const users = p.pgTable("users", {
  id: p.uuid().defaultRandom().primaryKey(),
  username: p.varchar({ length: 50 }).notNull(),
  email: p.varchar({ length: 50 }).notNull().unique(),
  password: p.varchar({ length: 255 }).notNull(),
});

export const customers = p.pgTable("customers", {
  id: p.uuid().defaultRandom().primaryKey(),
  name: p.varchar({ length: 50 }).notNull(),
  email: p.varchar({ length: 50 }).notNull().unique(),
  imageUrl: p.varchar("image_url", { length: 255 }).notNull(),
});

export const customersRelations = orm.relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export const statusEnum = p.pgEnum("status", ["pending", "paid"]);

export const invoices = p.pgTable("invoices", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  customerId: p
    .uuid("customer_id")
    .notNull()
    .references((): p.AnyPgColumn => customers.id),
  amount: p.integer("amount").notNull(),
  status: statusEnum().default("pending"),
  date: p.date().notNull(),
});

export const invoicesRelations = orm.relations(invoices, ({ one }) => ({
  customers: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const revenues = p.pgTable("revenues", {
  month: p.varchar({ length: 4 }).notNull().unique(),
  revenue: p.integer().notNull(),
});