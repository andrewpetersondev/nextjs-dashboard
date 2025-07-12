import * as z from "zod";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";

/**
 * Allowed invoice statuses.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;

/**
 * Type for invoice status.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Error map for invoice actions.
 */
export type InvoiceErrorMap = Partial<
  Record<"amount" | "customerId" | "status", string[]>
>;

/**
 * Fields for invoice creation form.
 */
export type CreateInvoiceFormFields = {
  amount: number | "";
  status: InvoiceStatus;
  customerId: CustomerId | "";
};

/**
 * Input type for creating an invoice.
 */
export type InvoiceCreateInput = {
  amount: number;
  customerId: CustomerId;
  date: string;
  status: InvoiceStatus;
};

/**
 * Input type for updating an invoice.
 */
export type InvoiceUpdateInput = Partial<
  Omit<InvoiceCreateInput, "customerId">
> & {
  customerId?: CustomerId;
};

/**
 * Raw DB row for an invoice.
 */
export type _InvoiceDbRow = {
  id: InvoiceId;
  amount: number;
  customerId: CustomerId;
  date: string;
  status: InvoiceStatus;
};

/**
 * Row for invoice table queries (with customer info).
 */
export type InvoiceTableRow = {
  id: InvoiceId;
  amount: number;
  date: string;
  status: InvoiceStatus;
  customerId: CustomerId;
  name: string;
  email: string;
  imageUrl: string | null;
};

/**
 * Row for latest invoices (with formatted amount).
 */
export type LatestInvoiceRow = Omit<InvoiceTableRow, "amount"> & {
  amount: string; // Formatted currency
};

/**
 * Row for filtered invoices (with formatted amount).
 */
export type FetchFilteredInvoicesData = Omit<InvoiceTableRow, "amount"> & {
  amount: string; // Formatted currency
};

/**
 * Fields for invoice editing (all optional for PATCH semantics).
 */
export type _EditInvoiceFormFields = Partial<CreateInvoiceFormFields>;

/**
 * State for the invoice form.
 */
export type _InvoiceFormFields = {
  id: InvoiceId | "";
  customerId: CustomerId | "";
  amount: number | "";
  status: InvoiceStatus;
  date: string;
};

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
export type InvoiceActionResult<T = undefined, E = Record<string, string[]>> = {
  readonly data?: T;
  readonly errors?: E;
  readonly message: string;
  readonly success: boolean;
};

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

export const CreateInvoiceSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  status: statusSchema,
});
