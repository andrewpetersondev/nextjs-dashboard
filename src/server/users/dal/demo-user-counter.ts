import "server-only";

import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";

import type { AuthRole } from "@/shared/auth/types";
import { demoUserCounters } from "../../../../node-only/schema/demo-users";

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 * @param db - The database instance (Drizzle)
 * @param role - The branded UserRole
 * @returns The new counter value as a number
 */
export async function demoUserCounter(
  db: Database,
  role: AuthRole,
): Promise<number> {
  try {
    // Insert a new counter-row for the given role and return the new id
    const [counterRow] = await db
      .insert(demoUserCounters)
      .values({ count: 1, role })
      .returning();

    // Defensive: Ensure the counterRow and id are valid
    // if (!counterRow || typeof counterRow.id !== "number") {
    // 	throw new Error("Invalid counter row returned from database.");
    // }

    // Defensive: Ensure the counterRow and id are valid (id is always a number, so just check for nullish)
    if (!counterRow || counterRow.id == null) {
      throw new Error("Invalid counter row returned from database.");
    }

    return counterRow.id;
  } catch (error) {
    serverLogger.error({
      context: "demoUserCounter",
      error,
      message: "Failed to read the demo user counter.",
      role,
    });
    throw new DatabaseError(
      "Failed to read the demo user counter.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
