export interface InvoiceFormCreds {
  readonly amount: string;
  readonly customerId: string;
  readonly date: string;
  readonly sensitiveData: string;
  readonly status: string;
}

export interface InvoiceSeed {
  invoice: InvoiceFormCreds;
  invoiceId: string;
}
