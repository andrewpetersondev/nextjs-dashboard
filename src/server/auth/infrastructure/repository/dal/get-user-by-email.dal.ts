// src/server/auth/infrastructure/repository/dal/get-user-by-email.dal.ts
import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthDalLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import type { Logger } from "@/shared/logging/logger.shared";

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
  const dalContext: AuthLogLayerContext<"infrastructure.dal"> =
    createAuthOperationContext({
      identifiers: { email },
      layer: "infrastructure.dal",
      operation,
    });

  const dalLogger = parentLogger.withContext(dalContext.loggerContext);

  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!userRow) {
        dalLogger.operation("info", "User not found for login", {
          ...AuthDalLogFactory.notFound(operation, { email }),
          context: dalContext.loggerContext,
        });
        return null;
      }

      dalLogger.operation("info", "User loaded for login", {
        ...AuthDalLogFactory.success(operation, { email }),
        context: dalContext.loggerContext,
      });

      return userRow;
    },
    dalContext,
    parentLogger,
  );
}
