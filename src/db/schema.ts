import * as p from "drizzle-orm/pg-core";

export const users = p.pgTable("users", {
  id: p.uuid().defaultRandom().primaryKey(),
  username: p.varchar({ length: 255 }).notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  password: p.varchar({ length: 255 }).notNull(),
  timestamp: p.timestamp().defaultNow(),
});

// export const customers = p.pgTable("customers", {
//   id: p.uuid("id").defaultRandom().primaryKey(),
//   name: p.varchar({ length: 255 }).notNull(),
//   email: p.text("email").notNull().unique(),
//   image_url: p.text("image_url").notNull(),
//   timestamp: p.timestamp().defaultNow(),
// });

// export const paymentStatusEnum = p.pgEnum("paymentStatus", ["pending", "paid"]);
//
// export const invoices = p.pgTable("invoices", {
//   id: p.uuid("id").defaultRandom().primaryKey(),
//   customer_id: p
//     .uuid("customer_id")
//     .notNull()
//     .references((): p.AnyPgColumn => customers.id),
//   amount: p.integer().notNull(),
//   paymentStatus: paymentStatusEnum().default("pending"),
//   date: p.date().notNull(),
//   timestamp: p.timestamp().defaultNow(),
// });

// export const revenue = p.pgTable("revenue", {
//   month: p.varchar({ length: 4 }).notNull().unique(),
//   revenue: p.integer().notNull(),
//   timestamp: p.timestamp().defaultNow(),
// });