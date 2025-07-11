import { z as zod } from "zod";
import type { CustomerId } from "@/lib/definitions/customers.types";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

// --- Domain Types ---

/**
 * Branded type for Invoice IDs.
 */
export type InvoiceId = string & { readonly __brand: unique symbol };
/**
 * Invoice statuses as a constant tuple for type safety.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;
/**
 * Type for invoice statuses.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
/**
 * Error map for invoice actions.
 */
export type InvoiceErrorMap = Partial<
  Record<"amount" | "customerId" | "status", string[]>
>;

// --- UI and Server Actions: Form Types ---

/**
 * Fields for invoice creation (user input).
 * `date` is not included; it is set server-side.
 */
export type CreateInvoiceFormFields = {
  amount: number | "";
  status: InvoiceStatus;
  customerId: CustomerId | "";
};

/**
 * Fields for invoice editing (all optional for PATCH semantics).
 */
export type EditInvoiceFormFields = Partial<CreateInvoiceFormFields>;

/**
 * State for the invoice form.
 */
export type InvoiceFormFields = {
  id: InvoiceId | "";
  customerId: CustomerId | "";
  amount: number | "";
  status: InvoiceStatus;
  date: string;
};

export type BrandedInvoiceInsert = {
  customerId: CustomerId;
  amount: number;
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

// --- Result/State types for create/edit actions ---

/**
 * Generic action result type for server actions.
 * @template T - The data payload type.
 * @template E - The error map type.
 */
export type InvoiceActionResult<T = undefined, E = Record<string, string[]>> = {
  readonly data?: T;
  readonly errors?: E;
  readonly message: string;
  readonly success: boolean;
};

/**
 * Result type for create invoice action.
 */
export type CreateInvoiceResult = InvoiceActionResult<
  undefined,
  InvoiceErrorMap
>;

/**
 * Result type for update invoice action.
 */
export type UpdateInvoiceResult = InvoiceActionResult<
  InvoiceDto,
  InvoiceErrorMap
>;

// --- Database Row Types ---

export interface DbRowBase<
  Id extends string = string,
  StatusType extends string = string,
> {
  id: Id;
  amount: number;
  status: StatusType;
}

export interface FilteredInvoiceDbRow extends DbRowBase {
  date: string;
  name: string;
  email: string;
  imageUrl: string;
}

export interface InvoiceByIdDbRow extends DbRowBase {
  customerId: string;
  date: string;
}

// --- UI Table Row Types ---

export interface FetchLatestInvoicesData {
  readonly id: InvoiceId;
  readonly amount: number;
  readonly email: string;
  readonly imageUrl: string;
  readonly name: string;
  readonly status: InvoiceStatus;
}

export type ModifiedLatestInvoicesData = Omit<
  FetchLatestInvoicesData,
  "amount"
> & {
  amount: string;
};

export interface FetchFilteredInvoicesData {
  readonly id: InvoiceId;
  readonly amount: number;
  readonly date: string;
  readonly name: string;
  readonly email: string;
  readonly imageUrl: string;
  readonly status: InvoiceStatus;
}

// --- Validation Schemas (zod) ---

const amountSchema = zod.coerce
  .number()
  .gt(0, { message: "Amount must be greater than $0." });

const customerIdSchema = zod.string({
  invalid_type_error: "Invalid customer id",
});

const statusSchema = zod.enum(INVOICE_STATUSES, {
  invalid_type_error: "Invalid status",
});

export const CreateInvoiceSchema = zod.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  status: statusSchema,
});
