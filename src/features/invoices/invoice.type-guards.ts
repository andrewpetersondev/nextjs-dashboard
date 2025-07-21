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

/**
 * Type guard to ensure an InvoiceDto has a defined `id`.
 * @param invoice - The InvoiceDto object to check.
 * @returns `true` if `id` is defined, otherwise `false`.
 */
export function hasInvoiceId(
  invoice: InvoiceDto,
): invoice is InvoiceDto & { id: string } {
  return typeof invoice.id === "string" && invoice.id.trim().length > 0;
}
