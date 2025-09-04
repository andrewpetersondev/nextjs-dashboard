import "server-only";

import type { LogMetadata } from "@/server/revenues/events/logging";
import type { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
import type { RevenueService } from "@/server/revenues/services/revenue.service";
import type { InvoiceDto } from "@/shared/invoices/dto";

export interface CoreArgs {
  readonly baseMeta: MetadataBase;
  readonly context: string;
  readonly currentInvoice: InvoiceDto;
  readonly previousInvoice: InvoiceDto;
  readonly revenueService: RevenueService;
}

export type ChangeType =
  | "eligible-to-ineligible"
  | "ineligible-to-eligible"
  | "eligible-amount-change"
  | "none";

export interface MetadataBase extends LogMetadata {
  readonly currentStatus: InvoiceDto["status"];
  readonly invoice: InvoiceDto["id"];
  readonly previousStatus: InvoiceDto["status"];
}

export interface MetadataWithPeriod extends MetadataBase {
  readonly period: string; // periodKey string
}

export type PeriodArg = Parameters<typeof processInvoiceForRevenue>[2];
