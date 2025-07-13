import * as z from "zod";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";

/**
 * Allowed invoice statuses.
 * Use this constant for validation and UI options.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;

/**
 * Type for invoice status.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Field names for invoice forms and error maps.
 */
export const INVOICE_FIELD_NAMES = ["amount", "customerId", "status"] as const;
export type InvoiceFieldName = (typeof INVOICE_FIELD_NAMES)[number];

/**
 * Error map for invoice actions.
 */
export type InvoiceErrorMap = Partial<Record<InvoiceFieldName, string[]>>;

/**
 * Fields for invoice creation form.
 */
export type CreateInvoiceFormFields = Readonly<{
  amount: number | "";
  status: InvoiceStatus;
  customerId: CustomerId | "";
}>;

/**
 * Input type for creating an invoice.
 */
export type InvoiceCreateInput = Readonly<{
  amount: number;
  customerId: CustomerId;
  date: string;
  status: InvoiceStatus;
}>;

/**
 * Input type for updating an invoice.
 */
export type InvoiceUpdateInput = Readonly<
  Partial<Omit<InvoiceCreateInput, "customerId">> & {
    customerId?: CustomerId;
  }
>;

/**
 * Raw DB row for an invoice.
 */
export type _InvoiceDbRow = Readonly<{
  id: InvoiceId;
  amount: number;
  customerId: CustomerId;
  date: string;
  status: InvoiceStatus;
}>;

/**
 * Row for invoice table queries (with customer info).
 */
export type InvoiceTableRow = Readonly<{
  id: InvoiceId;
  amount: number;
  date: string;
  status: InvoiceStatus;
  customerId: CustomerId;
  name: string;
  email: string;
  imageUrl: string | null;
}>;

/**
 * Row for latest invoices (with formatted amount).
 */
export type LatestInvoiceRow = Readonly<
  Omit<InvoiceTableRow, "amount"> & { amount: string }
>;

/**
 * Row for filtered invoices (with formatted amount).
 */
export type FetchFilteredInvoicesData = Readonly<
  Omit<InvoiceTableRow, "amount"> & { amount: string }
>;

/**
 * Fields for invoice editing (all optional for PATCH semantics).
 */
export type _EditInvoiceFormFields = Partial<CreateInvoiceFormFields>;

/**
 * State for the invoice form.
 */
export type _InvoiceFormFields = Readonly<{
  id: InvoiceId | "";
  customerId: CustomerId | "";
  amount: number | "";
  status: InvoiceStatus;
  date: string;
}>;

export type InvoiceCreateState = Readonly<{
  errors?: InvoiceErrorMap;
  message?: string;
  success?: boolean;
}>;

export type InvoiceEditState = Readonly<{
  invoice: InvoiceDto;
  errors?: InvoiceErrorMap;
  message?: string;
  success?: boolean;
}>;

/**
 * Generic action result type for server actions.
 */
export type InvoiceActionResult<
  T = undefined,
  E = Record<string, string[]>,
> = Readonly<{
  data?: T;
  errors?: E;
  message: string;
  success: boolean;
}>;

export type _CreateInvoiceResult = InvoiceActionResult<
  undefined,
  InvoiceErrorMap
>;
export type _UpdateInvoiceResult = InvoiceActionResult<
  InvoiceDto,
  InvoiceErrorMap
>;

/**
 * Zod validation schema for invoice creation.
 * Exported for reuse in validation and tests.
 */
const amountSchema = z.coerce
  .number()
  .gt(0, { error: "Amount must be greater than $0." })
  .lt(10000, { error: "Amount must be less than $10,000." });

const customerIdSchema = z.string({
  error: (issue) =>
    issue.input === undefined
      ? "Customer ID is required."
      : "Customer ID must be a string.",
});

const statusSchema = z.enum(INVOICE_STATUSES, {
  error: (issue) =>
    issue.input === undefined
      ? "Invoice status is required"
      : "Invalid invoice status",
});

/**
 * Zod schema for validating invoice creation input.
 */
export const CreateInvoiceSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  status: statusSchema,
});
