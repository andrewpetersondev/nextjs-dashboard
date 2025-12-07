/**
 * Schema overview
 * - Uses branded IDs (UserId, InvoiceId, etc.) to constrain cross-table usage at compile time.
 * - Represents money in integer cents for precision (no floating-point). Uses bigint to avoid overflow.
 * - Timestamps are stored as timestamptz for consistency across time zones.
 * - Check constraints enforce basic data invariants.
 * - Indexes are added for common joins/filters.
 */

import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";
import {
  USER_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import type { UserId } from "@/shared/branding/brands";
import { sessions } from "./sessions";

export const roleEnum = pgEnum("role", USER_ROLES);

export const users = pgTable("users", {
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  id: uuid("id").defaultRandom().primaryKey().$type<UserId>(),
  password: varchar("password", { length: 255 })
    .notNull()
    .$type<PasswordHash>(),
  role: roleEnum("role").default(USER_ROLE).notNull().$type<UserRole>(),
  sensitiveData: varchar("sensitive_data", { length: 255 })
    .notNull()
    .default("cantTouchThis"),
  username: varchar("username", { length: 50 }).notNull().unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

/**
 * Type representing a row returned from the users table when performing a select query.
 * Use this for reading or updating existing users.
 */
export type UserRow = typeof users.$inferSelect;

/**
 * Type representing the shape of data required to insert a new user into the users table.
 * Use this when creating or inserting new users.
 */
export type NewUserRow = typeof users.$inferInsert;
