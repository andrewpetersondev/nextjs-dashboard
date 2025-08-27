import "server-only";

import type { CustomerRow } from "@/server/db/schema";

/**
 * Raw DB shape for "select" options. Reflects the query selection in DAL.
 * Note: id is the raw DB type, not branded.
 */
export type CustomerSelectRowRaw = {
  id: CustomerRow["id"];
  name: CustomerRow["name"];
};

/**
 * Raw DB shape for the aggregated customers table query.
 * Totals from SUM(...) can be null when no matching rows exist.
 */
export type CustomerAggregatesRowRaw = {
  id: CustomerRow["id"];
  name: CustomerRow["name"];
  email: CustomerRow["email"];
  imageUrl: CustomerRow["imageUrl"];
  totalInvoices: number; // COUNT() returns 0, not null
  totalPaid: number | null; // SUM(...) can be null
  totalPending: number | null; // SUM(...) can be null
};
