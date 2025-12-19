import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { revenues } from "@/server/db/schema/revenues";
import type { RevenueId } from "@/shared/branding/brands";
import {
  makeDatabaseError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Deletes a revenue record from the database.
 * @param db - The database connection.
 * @param id - The revenue ID to delete.
 * @throws Error if the ID is invalid or deletion fails.
 */
export async function deleteRevenue(
  db: AppDatabase,
  id: RevenueId,
): Promise<void> {
  if (!id) {
    throw makeValidationError({
      message: "Revenue ID is required",
      metadata: { id: id ?? "null" },
    });
  }

  const result = await db
    .delete(revenues)
    .where(eq(revenues.id, id))
    .returning();

  if (!result) {
    throw makeDatabaseError({
      message: "Failed to delete revenue record",
      metadata: { table: "revenues" },
    });
  }
}
