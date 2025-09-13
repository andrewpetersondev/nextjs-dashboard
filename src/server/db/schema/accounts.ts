import type { AdapterAccountType } from "@auth/core/adapters";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const accounts = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    expires: integer("expires_at"),
    idToken: text("id_token"),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    scope: text("scope"),
    sessionState: text("session_state"),
    tokenType: text("token_type"),
    type: text("type").$type<AdapterAccountType>().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
    index("account_user_id_idx").on(account.userId),
  ],
);
