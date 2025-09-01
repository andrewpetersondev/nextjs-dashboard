import "server-only";

import { count } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/server/customers/messages";
import type { Database } from "@/server/db/connection";
import { customers } from "@/server/db/schema/schema";
import { ValidationError } from "@/shared/errors/domain";

/**
 * Fetches the total number of customers.
 */
export async function fetchTotalCustomersCountDal(
  db: Database,
): Promise<number> {
  const value = await db
    .select({ value: count(customers.id) })
    .from(customers)
    .then((rows) => rows[0]?.value ?? 0);

  if (value === undefined) {
    throw new ValidationError(
      CUSTOMER_SERVER_ERROR_MESSAGES.FETCH_TOTAL_FAILED,
    );
  }

  return value;
}
