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

export const roleEnum = pgEnum("role", ["guest", "admin", "user"]);

export const users = pgTable("users", {
	email: varchar("email", { length: 50 }).notNull().unique(),
	id: uuid("id").defaultRandom().primaryKey(),
	password: varchar("password", { length: 255 }).notNull(),
	role: roleEnum("role").default("user").notNull(),
	sensitiveData: varchar("sensitive_data", { length: 50 })
		.notNull()
		.default("cantTouchThis"),
	username: varchar("username", { length: 50 }).notNull(),
});

export const demoUserCounters = pgTable("demo_user_counters", {
	count: integer("count").notNull().default(0),
	id: serial("id").primaryKey(),
	role: text("role").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
}));

export const customers = pgTable("customers", {
	email: varchar("email", { length: 50 }).notNull().unique(),
	id: uuid("id").defaultRandom().primaryKey(),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	name: varchar("name", { length: 50 }).notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
	invoices: many(invoices),
}));

export const statusEnum = pgEnum("status", ["pending", "paid"]);

export const invoices = pgTable("invoices", {
	amount: integer("amount").notNull(),
	customerId: uuid("customer_id")
		.notNull()
		.references((): AnyPgColumn => customers.id),
	date: date("date").notNull(),
	id: uuid("id").defaultRandom().primaryKey(),
	status: statusEnum("status").default("pending").notNull(),
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
	expiresAt: timestamp("expires_at").notNull(),
	id: uuid("id").defaultRandom().primaryKey(),
	token: text("token"),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));
