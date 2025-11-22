import "server-only";
import { count } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { BaseError } from "@/shared/errors/core/base-error";
import { logger } from "@/shared/logging/infra/logger.shared";
import { DASHBOARD_ERROR_MESSAGES } from "@/shell/dashboard/error-messages";

/**
 * Fetches the total number of invoices.
 * @param db - Drizzle database instance
 * @returns Total number of invoices as a number.
 */
export async function fetchTotalInvoicesCountDal(
  db: AppDatabase,
): Promise<number> {
  try {
    const [result] = await db
      .select({ value: count(invoices.id) })
      .from(invoices);

    return result?.value ?? 0;
  } catch (error) {
    logger.error("Error fetching total invoices count", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    const context = error instanceof Error ? {} : { error };
    const cause = error instanceof Error ? error : undefined;

    throw new BaseError("database", {
      cause,
      context,
      message: DASHBOARD_ERROR_MESSAGES.fetchDashboardCards,
    });
  }
}
