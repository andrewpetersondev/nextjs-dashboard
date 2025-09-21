import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { LogMetadata } from "@/server/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import type { Period } from "@/shared/domain/domain-brands";

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
  | "eligible-status-change"
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

export type PeriodArg = Period;
