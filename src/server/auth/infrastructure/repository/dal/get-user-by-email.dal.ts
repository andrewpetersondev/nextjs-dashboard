// src/server/auth/infrastructure/repository/dal/get-user-by-email.dal.ts
import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  createDalContext,
  type DalContext,
} from "@/server/auth/logging/dal-context";
import { INFRASTRUCTURE_CONTEXTS } from "@/server/auth/logging/infrastructure-error.logging";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import type { Logger } from "@/shared/logging/logger.shared";

const { context, notFound, success } =
  INFRASTRUCTURE_CONTEXTS.dal.getUserByEmail;

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
  parentLogger: Logger,
  /**
   * Logical operation name for logging.
   * Defaults to "getUserByEmail" but callers (e.g. login repo) can override.
   */
  operation: "getUserByEmail" | "login" = "getUserByEmail",
): Promise<UserRow | null> {
  const dalContext: DalContext = createDalContext(operation, context, {
    email,
  });

  const dalLogger = parentLogger.withContext(dalContext.context);

  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!userRow) {
        const resultMeta = notFound(email);

        dalLogger.operation("info", "User not found for login", {
          context: dalContext.context,
          identifiers: resultMeta.identifiers,
          // standardized infra-level failure kind
          kind: resultMeta.kind, // "not_found"
          operation: dalContext.operation, // "login" in repo login flow
        } as const);

        return null;
      }

      const resultMeta = success(email);

      dalLogger.operation("info", "User loaded for login", {
        context: dalContext.context,
        identifiers: resultMeta.identifiers,
        kind: resultMeta.kind, // "success"
        operation: dalContext.operation,
      } as const);

      return userRow;
    },
    dalContext,
    parentLogger,
  );
}
