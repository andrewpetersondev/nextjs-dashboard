import type { InvoiceStatus } from "@/shared/invoices/invoices";

export type BaseInvoiceFormFields = {
  readonly amount: number;
  readonly customerId: string;
  readonly date: string; // todo: does the client send a date or a string?
  readonly sensitiveData: string; // todo: remove this
  readonly status: InvoiceStatus;
};

export type CreateInvoiceFormFields = BaseInvoiceFormFields;

// ID is not in the form fields because it is not editable! But the type can be used for Function Signatures.
export type UpdateInvoiceFormFields = BaseInvoiceFormFields & {
  readonly id: string;
};

export type BaseInvoiceFormFieldNames = keyof BaseInvoiceFormFields;
export type CreateInvoiceFormFieldNames = keyof CreateInvoiceFormFields;
export type UpdateInvoiceFormFieldNames = keyof UpdateInvoiceFormFields;
