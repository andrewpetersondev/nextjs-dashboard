import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import type { SessionId, UserId } from "@/shared/brands/domain-brands";
import { COLUMNS, commonFields, TABLES } from "./constants";
import { users } from "./users";

/**
 * Sessions: manages user authentication sessions.
 * - expiresAt uses timestamptz and no default; application sets expiry.
 */
export const sessions = pgTable(
  TABLES.SESSIONS,
  {
    createdAt: commonFields.timestamps.createdAt(),
    expiresAt: commonFields.timestamps.expiresAt(),
    id: commonFields.id.uuid().$type<SessionId>(),
    token: text(COLUMNS.TOKEN).notNull().unique(),
    updatedAt: commonFields.timestamps.updatedAt(),
    userId: uuid(COLUMNS.USER_ID)
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .$type<UserId>(),
  },
  (table) => [
    // Performance: frequent lookups and cleanup tasks
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
