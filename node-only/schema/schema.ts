/**
 * @file schema.ts
 * Drizzle ORM schema definitions for application tables, enums, and relations.
 *
 * Conventions:
 * - Monetary values stored as bigint cents.
 * - Timestamps use timestamptz for cross-timezone safety.
 * - Branded types constrain cross-table usage at compile time.
 */
import type { CustomerRow } from "./customers";
import type { DemoUserCounterRow } from "./demo-users";
import type { InvoiceRow } from "./invoices";
import type { RevenueRow } from "./revenues";
import type { SessionRow } from "./sessions";
import type { UserRow } from "./users";

/**
 * Union type for convenience in generic data-handling utilities.
 */
export type AnyTableRow =
  | UserRow
  | CustomerRow
  | InvoiceRow
  | RevenueRow
  | SessionRow
  | DemoUserCounterRow;

/**
 * Drizzle ORM relation warning (informational)
 * When both a foreign key constraint is defined in the table and a relation is specified via relations(),
 * Drizzle prints an informational warning and uses the FK for mapping. This is expected and safe to ignore.
 * Reference: https://orm.drizzle.team/docs/relations
 */
