import "server-only";

import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { revenues } from "@/server/db/schema/revenues";
import type { RevenueId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/core/errors/factories/app-error.factory";

/**
 * Deletes a revenue record from the database.
 * @param db - The database connection.
 * @param id - The revenue ID to delete.
 * @throws Error if the ID is invalid or deletion fails.
 */
export async function deleteRevenueDal(
  db: AppDatabase,
  id: RevenueId,
): Promise<void> {
  if (!id) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: "Revenue ID is required",
      metadata: {},
    });
  }

  const result = await db
    .delete(revenues)
    .where(eq(revenues.id, id))
    .returning();

  if (!result) {
    throw makeUnexpectedError("", {
      message: "Failed to delete revenue record",
      overrideMetadata: { table: "revenues" },
    });
  }
}
