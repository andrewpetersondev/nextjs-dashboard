import "server-only";

import { asc } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/modules/customers/domain/messages";
import type { CustomerSelectRowRaw } from "@/modules/customers/domain/types";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Fetches all customers for select options.
 * Returns a raw projection reflecting the DB selection (no branding).
 */
export async function fetchCustomersSelectDal(
  db: AppDatabase,
): Promise<CustomerSelectRowRaw[]> {
  try {
    return await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(asc(customers.name));
  } catch (error) {
    // Use structured logging in production
    console.error("Database Error:", error);
    throw makeAppError(APP_ERROR_KEYS.database, {
      cause: Error.isError(error)
        ? error
        : "failed to fetch customers for select",
      message: CUSTOMER_SERVER_ERROR_MESSAGES.fetchAllFailed,
      metadata: {},
    });
  }
}
