/**
 * Schema overview
 * - Uses branded IDs (UserId, InvoiceId, etc.) to constrain cross-table usage at compile time.
 * - Represents money in integer cents for precision (no floating-point). Uses bigint to avoid overflow.
 * - Timestamps are stored as timestamptz for consistency across time zones.
 * - Check constraints enforce basic data invariants.
 * - Indexes are added for common joins/filters.
 */

import { relations } from "drizzle-orm";
import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { AUTH_ROLES, type AuthRole } from "../../src/shared/auth/types";
import type { UserId } from "../../src/shared/brands/domain-brands";
import { commonFields } from "./constants";
import { sessions } from "./sessions";

// DB enums from domain constants to avoid duplication and drift
export const roleEnum = pgEnum("role", AUTH_ROLES);

/**
 * Users: authentication and profile info.
 */
export const users = pgTable("users", {
  email: commonFields.email(),
  id: commonFields.id.uuid().$type<UserId>(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull().$type<AuthRole>(),
  sensitiveData: commonFields.sensitiveData(),
  username: varchar("username", { length: 50 }).notNull().unique(),
});

/**
 * Relations for type-safe joins and queries.
 * Note: Drizzle may emit an informational warning when both FK constraints and relations are defined.
 * This is expected; the FK constraint will be used for relation mapping.
 */
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

/**
 * Inferred row types for type safety.
 * These represent raw DB rows; branded IDs require validation before cross-entity use.
 */
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
