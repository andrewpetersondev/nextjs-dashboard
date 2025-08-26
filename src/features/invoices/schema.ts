import { z } from "zod";
import { INVOICE_STATUSES } from "@/shared/invoices/invoices";

const MAX_INVOICE_AMOUNT = 10000;

// Client-side schema for invoice form validation
const amountSchema = z.coerce.number().positive().max(MAX_INVOICE_AMOUNT);
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, { error: "Date must be YYYY-MM-DD." });
const sensitiveDataSchema = z.string().min(2);
const statusSchema = z.enum(INVOICE_STATUSES);
const customerIdSchema = z.string().uuid();

export const InvoiceFormClientSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  date: dateSchema,
  sensitiveData: sensitiveDataSchema,
  status: statusSchema,
});
