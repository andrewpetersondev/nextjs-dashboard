import "server-only";

import { z } from "zod";
import { toCustomerId } from "@/shared/brands/mappers";
import {
  MAX_INVOICE_AMOUNT_USD,
  MAX_SENSITIVE_DATA_LENGTH,
  MIN_INVOICE_AMOUNT_USD,
  MIN_SENSITIVE_DATA_LENGTH,
} from "@/shared/invoices/constants";
import { INVOICE_STATUSES } from "@/shared/invoices/invoices";

// const uuidSchema = z.uuid(); // UUID is not needed for forms because id is in the URL
// Accept USD from forms and validate USD range; the service converts USD -> cents
const amountSchema = z.coerce
  .number()
  .min(MIN_INVOICE_AMOUNT_USD)
  .max(MAX_INVOICE_AMOUNT_USD);

const isoDateSchema = z.iso.date();

const sensitiveDataSchema = z
  .string()
  .min(MIN_SENSITIVE_DATA_LENGTH)
  .max(MAX_SENSITIVE_DATA_LENGTH);

const statusSchema = z.enum(INVOICE_STATUSES);

const customerIdSchema = z.string().transform(toCustomerId);

// Base validation schema - single source of truth
export const InvoiceBaseSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  date: isoDateSchema,
  sensitiveData: sensitiveDataSchema,
  status: statusSchema,
});

// Schema for creation (no ID, auto-generated date)
export const CreateInvoiceSchema = InvoiceBaseSchema;

// Schema for updates (all fields optional)
export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();
