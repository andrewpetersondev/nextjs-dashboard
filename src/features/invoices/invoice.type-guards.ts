import type { InvoiceEntity } from "@/db/models/invoice.entity";

/**
 * Type guard for InvoiceEntity.
 */
export function isInvoiceEntity(entity: unknown): entity is InvoiceEntity {
  return (
    typeof entity === "object" &&
    entity !== null &&
    "amount" in entity &&
    "customerId" in entity &&
    "date" in entity &&
    "id" in entity &&
    "sensitiveData" in entity &&
    "status" in entity
    // Add all required fields
  );
}
