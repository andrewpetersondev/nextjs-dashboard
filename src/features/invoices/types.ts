export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type BaseInvoiceFormFields = {
  readonly amount: number;
  readonly customerId: string;
  readonly date: string;
  readonly sensitiveData: string; // todo: remove this
  readonly status: InvoiceStatus;
};

export type CreateInvoiceFormFields = BaseInvoiceFormFields;
export type UpdateInvoiceFormFields = BaseInvoiceFormFields & {
  readonly id: string;
};

export type CreateInvoiceFormFieldNames = keyof CreateInvoiceFormFields;
export type UpdateInvoiceFormFieldNames = keyof UpdateInvoiceFormFields;
