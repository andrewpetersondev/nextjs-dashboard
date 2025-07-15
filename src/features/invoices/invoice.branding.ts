import "server-only";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceStatus } from "@/features/invoices/invoice.types";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";

/**
 * Brands invoice fields for DAL/database operations.
 * Accepts a partial set of fields and only brands those present.
 */
export function brandInvoiceFields(fields: Partial<InvoiceDto>): Partial<{
  amount: number;
  customerId: ReturnType<typeof toCustomerId>;
  date: string;
  id: ReturnType<typeof toInvoiceId>;
  status: ReturnType<typeof toInvoiceStatusBrand>;
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
export function _brandInvoiceFields_dep_v1<
  TFields extends {
    amount?: number;
    customerId?: string;
    date?: string;
    id?: string;
    status?: string;
  },
>(
  fields: TFields,
): {
  amount?: number;
  customerId?: ReturnType<typeof toCustomerId>;
  date?: string;
  id?: ReturnType<typeof toInvoiceId>;
  status?: ReturnType<typeof toInvoiceStatusBrand>;
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

/**
 * Fields that require branding for DAL/database operations.
 */
type InvoiceBrandableFields = {
  amount: number;
  customerId: string;
  date: string;
  id: string;
  status: InvoiceStatus;
};

/**
 * Brands invoice fields for DAL/database operations.
 * Accepts a partial set of fields and only brands those present.
 */
export function _brandInvoiceFields_dep_v2(
  fields: Partial<InvoiceBrandableFields>,
): Partial<{
  amount: number;
  customerId: ReturnType<typeof toCustomerId>;
  date: string;
  id: ReturnType<typeof toInvoiceId>;
  status: ReturnType<typeof toInvoiceStatusBrand>;
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
