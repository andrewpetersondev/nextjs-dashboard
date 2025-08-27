import "server-only";

import { count } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { DATA_ERROR_MESSAGES } from "@/shared/constants/errors-messages";

/**
 * Fetches the total number of invoices.
 * @param db - Drizzle database instance
 * @returns Total number of invoices as a number.
 */
export async function fetchTotalInvoicesCountDal(
  db: Database,
): Promise<number> {
  try {
    const [result] = await db
      .select({ value: count(invoices.id) })
      .from(invoices);

    return result?.value ?? 0;
  } catch (error) {
    serverLogger.error({
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Error fetching total invoices count",
      stack: error instanceof Error ? error.stack : undefined,
    });

    const context = error instanceof Error ? {} : { error };
    const cause = error instanceof Error ? error : undefined;

    throw new DatabaseError(
      DATA_ERROR_MESSAGES.ERROR_FETCH_DASHBOARD_CARDS,
      context,
      cause,
    );
  }
}
