// Client-safe definitions. Do not import from server modules here.

export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type BaseInvoiceFormFields = {
  amount: number;
  customerId: string;
  date: string;
  status: InvoiceStatus;
};

export type CreateInvoiceFormFields = keyof BaseInvoiceFormFields;
export type UpdateInvoiceFormFields = keyof BaseInvoiceFormFields & {
  id: string;
};
