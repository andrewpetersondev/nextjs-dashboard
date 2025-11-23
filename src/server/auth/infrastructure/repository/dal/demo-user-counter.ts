// src/server/auth/infrastructure/repository/dal/demo-user-counter.ts
import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthDalLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { makeIntegrityError } from "@/shared/errors/core/base-error.factory";
import { logger } from "@/shared/logging/infra/logging.client";

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 * @param db - The database instance (Drizzle)
 * @param role - The branded UserRole
 * @returns The new counter value as a number
 */
export async function demoUserCounter(
  db: AppDatabase,
  role: UserRole,
): Promise<number> {
  const dalContext: AuthLogLayerContext<"infrastructure.dal"> =
    createAuthOperationContext({
      identifiers: { role },
      layer: "infrastructure.dal",
      operation: "demoUser",
    });

  return await executeDalOrThrow(
    async () => {
      const [counterRow] = await db
        .insert(demoUserCounters)
        .values({ count: 1, role })
        .returning();

      if (!counterRow) {
        logger.operation(
          "error",
          "Invariant failed: demoUserCounter did not return a row",
          {
            kind: "invariant" as const,
            operationIdentifiers: dalContext.identifiers,
            operationName: dalContext.operation,
          },
        );
        throw makeIntegrityError({
          context: {
            kind: "invariant",
          },
          message: "Invariant: insert did not return a row",
        });
      }

      if (counterRow.id == null) {
        logger.operation("error", "Invalid counter row returned: missing id", {
          details: { counterRow },
          kind: "invariant" as const,
          operationIdentifiers: dalContext.identifiers,
          operationName: dalContext.operation,
        });
        throw makeIntegrityError({
          context: {
            counterRow,
            kind: "invariant",
          },
          message: "Invariant: demo user counter row returned with null id",
        });
      }

      const resultMeta = AuthDalLogFactory.success(
        "demoUser",
        { role },
        { count: counterRow.id },
      );

      logger.operation("info", "Demo user counter created for role", {
        ...resultMeta,
      });

      return counterRow.id;
    },
    dalContext,
    logger,
  );
}
