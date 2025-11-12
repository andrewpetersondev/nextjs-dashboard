import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { logger } from "@/shared/logging/logger.shared";

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
  const metadata = {
    context: "dal.demo.users.counter",
    identifiers: { role },
    operation: "createDemoUser",
  } as const;

  return await executeDalOrThrow(async () => {
    const [counterRow] = await db
      .insert(demoUserCounters)
      .values({ count: 1, role })
      .returning();

    if (!counterRow) {
      logger.operation(
        "error",
        "Invariant failed: demoUserCounter did not return a row",
        {
          ...metadata,
          kind: "invariant" as const,
        },
      );
      throw BaseError.wrap(
        "integrity",
        new Error("Invariant: insert did not return a row"),
        {
          ...metadata,
          kind: "invariant",
        },
      );
    }

    if (counterRow.id == null) {
      logger.operation("error", "Invalid counter row returned: missing id", {
        ...metadata,
        counterRow,
        kind: "invariant" as const,
      });
      throw BaseError.wrap(
        "integrity",
        new Error("Invariant: demo user counter row returned with null id"),
        {
          ...metadata,
          counterRow,
          kind: "invariant",
        },
      );
    }

    logger.operation("info", "Demo user counter created for role", {
      ...metadata,
      counterId: counterRow.id,
    });

    return counterRow.id;
  }, metadata);
}
