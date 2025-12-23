import "server-only";
import { asc } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/modules/customers/domain/messages";
import type { CustomerSelectRowRaw } from "@/modules/customers/domain/types";
import type { AppDatabase } from "@/server/db/db.connection";
import { customers } from "@/server/db/schema/customers";
import { AppError } from "@/shared/errors/core/app-error.entity";

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
    throw new AppError("database", {
      cause: "",
      message: CUSTOMER_SERVER_ERROR_MESSAGES.fetchAllFailed,
      metadata: {},
    });
  }
}
