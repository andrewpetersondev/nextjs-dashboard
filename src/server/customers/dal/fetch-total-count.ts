import "server-only";

import { count } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/server/customers/types";
import type { Database } from "@/server/db/connection";
import { customers } from "@/server/db/schema";
import { ValidationError_New } from "@/shared/errors/domain";

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
    throw new ValidationError_New(
      CUSTOMER_SERVER_ERROR_MESSAGES.FETCH_TOTAL_FAILED,
    );
  }

  return value;
}
