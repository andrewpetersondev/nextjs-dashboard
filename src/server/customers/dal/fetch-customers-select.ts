import "server-only";

import { asc } from "drizzle-orm";
import {
  CUSTOMER_SERVER_ERROR_MESSAGES,
  type CustomerSelectRowRaw,
} from "@/server/customers/types";
import type { Database } from "@/server/db/connection";
import { customers } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";

/**
 * Fetches all customers for select options.
 * Returns a raw projection reflecting the DB selection (no branding).
 */
export async function fetchCustomersSelectDal(
  db: Database,
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
    throw new DatabaseError(
      CUSTOMER_SERVER_ERROR_MESSAGES.FETCH_ALL_FAILED,
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
