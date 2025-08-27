// Client form types mirror the transport DTO exactly (plain, serializable shapes)
// import type { InvoiceFormDto } from "@/shared/invoices/dto";

// Single source of truth for the UI form payload
// export type InvoiceFormFields = InvoiceFormDto;

// Create/update payloads for specific use-cases
// export type CreateInvoiceFormFields = InvoiceFormFields;
// export type UpdateInvoiceFormFields = InvoiceFormFields & {
//   readonly id: string;
// };

// Field-name unions derived from the single form type
// export type InvoiceFormFieldNames = keyof InvoiceFormFields;
// export type CreateInvoiceFormFieldNames = keyof CreateInvoiceFormFields;
