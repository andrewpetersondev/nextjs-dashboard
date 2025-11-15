// src/server/auth/infrastructure/repository/dal/demo-user-counter.ts
import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import {
  createDalContext,
  type DalContext,
} from "@/server/auth/infrastructure/dal-context";
import { INFRASTRUCTURE_CONTEXTS } from "@/server/auth/infrastructure/infrastructure-error.logging";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { BaseError } from "@/shared/core/errors/base-error";
import { ERROR_CODES } from "@/shared/core/errors/error-codes";
import { logger } from "@/shared/logging/logger.shared";

const { context, success } = INFRASTRUCTURE_CONTEXTS.dal.demoUserCounter;

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 * @param db - The database instance (Drizzle)
 * @param role - The branded UserRole
 * @returns The new counter value as a number
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function demoUserCounter(
  db: AppDatabase,
  role: UserRole,
): Promise<number> {
  const dalContext: DalContext = createDalContext("createDemoUser", context, {
    role,
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
            context: dalContext.context,
            identifiers: dalContext.identifiers,
            kind: "invariant" as const,
            operation: dalContext.operation,
          },
        );
        throw BaseError.wrap(
          ERROR_CODES.integrity.name,
          new Error("Invariant: insert did not return a row"),
          {
            ...dalContext,
            kind: "invariant",
          },
        );
      }

      if (counterRow.id == null) {
        logger.operation("error", "Invalid counter row returned: missing id", {
          context: dalContext.context,
          counterRow,
          identifiers: dalContext.identifiers,
          kind: "invariant" as const,
          operation: dalContext.operation,
        });
        throw BaseError.wrap(
          ERROR_CODES.integrity.name,
          new Error("Invariant: demo user counter row returned with null id"),
          {
            ...dalContext,
            counterRow,
            kind: "invariant",
          },
        );
      }

      const resultMeta = success(role, counterRow.id);

      logger.operation("info", "Demo user counter created for role", {
        context: dalContext.context,
        identifiers: {
          ...dalContext.identifiers,
          counterId: counterRow.id,
        },
        kind: resultMeta.kind,
        operation: dalContext.operation,
        ...(resultMeta.details && { details: resultMeta.details }),
      });

      return counterRow.id;
    },
    dalContext,
    logger,
  );
}
