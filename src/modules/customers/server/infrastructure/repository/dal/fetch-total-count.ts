import "server-only";
import { count } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/modules/customers/domain/messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { AppError } from "@/shared/errors/core/app-error";

/**
 * Fetches the total number of customers.
 */
export async function fetchTotalCustomersCountDal(
  db: AppDatabase,
): Promise<number> {
  const value = await db
    .select({ value: count(customers.id) })
    .from(customers)
    .then((rows) => rows[0]?.value ?? 0);

  if (value === undefined) {
    throw new AppError("validation", {
      cause: "",
      message: CUSTOMER_SERVER_ERROR_MESSAGES.fetchTotalFailed,
      metadata: {},
    });
  }

  return value;
}
