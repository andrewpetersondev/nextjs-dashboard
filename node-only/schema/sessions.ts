import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { UserId } from "../../src/shared/brands/domain-brands";
import { users } from "./users";

export const sessions = pgTable(
  "session",
  {
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .$type<UserId>(),
  },
  (table) => [
    // Performance: frequent lookups and cleanup tasks
    index("session_user_id_idx").on(table.userId),
    index("session_expires_idx").on(table.expires),
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
