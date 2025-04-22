import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  AnyPgColumn,
  integer,
  date,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 50 }).notNull().unique(),
  role: roleEnum("role").default("user").notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email", { length: 50 }).notNull().unique(),
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
  status: statusEnum("status").default("pending").notNull(),
  date: date("date").notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customers: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const revenues = pgTable("revenues", {
  // id: uuid().defaultRandom().primaryKey(),
  month: varchar("month", { length: 4 }).notNull().unique(),
  revenue: integer("revenue").notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token"),
  expiresAt: timestamp("expires_at").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));