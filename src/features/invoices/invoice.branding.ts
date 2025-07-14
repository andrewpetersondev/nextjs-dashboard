import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";

/**
 * Fields that require branding for DAL/database operations.
 */
type InvoiceBrandableFields = {
  amount: number;
  customerId: string;
  status: string;
  id: string;
  date: string;
};

/**
 * Brands invoice fields for DAL/database operations.
 * Accepts a partial set of fields and only brands those present.
 */
export function brandInvoiceFields(
  fields: Partial<InvoiceBrandableFields>,
): Partial<{
  amount: number;
  customerId: ReturnType<typeof toCustomerId>;
  status: ReturnType<typeof toInvoiceStatusBrand>;
  id: ReturnType<typeof toInvoiceId>;
  date: string;
}> {
  return {
    ...(fields.amount !== undefined && { amount: fields.amount }),
    ...(fields.customerId !== undefined && {
      customerId: toCustomerId(fields.customerId),
    }),
    ...(fields.status !== undefined && {
      status: toInvoiceStatusBrand(fields.status),
    }),
    ...(fields.id !== undefined && { id: toInvoiceId(fields.id) }),
    ...(fields.date !== undefined && { date: fields.date }),
  };
}

/**
 * Brands invoice fields for DAL/database operations.
 * Accepts a partial set of fields and only brands those present.
 */
export function _brandInvoiceFields_deprecated<
  TFields extends {
    amount?: number;
    customerId?: string;
    status?: string;
    id?: string;
    date?: string;
  },
>(
  fields: TFields,
): {
  amount?: number;
  customerId?: ReturnType<typeof toCustomerId>;
  status?: ReturnType<typeof toInvoiceStatusBrand>;
  id?: ReturnType<typeof toInvoiceId>;
  date?: string;
} {
  return {
    ...(fields.amount !== undefined && { amount: fields.amount }),
    ...(fields.customerId !== undefined && {
      customerId: toCustomerId(fields.customerId),
    }),
    ...(fields.status !== undefined && {
      status: toInvoiceStatusBrand(fields.status),
    }),
    ...(fields.id !== undefined && { id: toInvoiceId(fields.id) }),
    ...(fields.date !== undefined && { date: fields.date }),
  };
}
