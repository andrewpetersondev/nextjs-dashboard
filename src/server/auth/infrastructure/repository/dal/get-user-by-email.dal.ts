// src/server/auth/infrastructure/repository/dal/get-user-by-email.dal.ts
import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthDalLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import type { AuthOperation } from "@/server/auth/logging-auth/auth-logging.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
  parentLogger: LoggingClientContract,
  operation: AuthOperation = "getUserByEmail",
): Promise<UserRow | null> {
  const dalContext: AuthLogLayerContext<"infrastructure.dal"> =
    createAuthOperationContext({
      identifiers: { email },
      layer: "infrastructure.dal",
      operation,
    });

  const dalLogger = parentLogger.child({ scope: "dal" });

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
        });
        return null;
      }

      dalLogger.operation("info", "User found", {
        details: { email },
        operationName: "getUserByEmail",
      });

      return userRow;
    },
    dalContext,
    parentLogger,
  );
}
