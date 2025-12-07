import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { InvoiceStatus } from "@/modules/invoices/domain/types";
import type { LogMetadata } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { Period } from "@/shared/branding/brands";

export type ChangeType =
  | "eligible-to-ineligible"
  | "ineligible-to-eligible"
  | "eligible-status-change"
  | "eligible-amount-change"
  | "none";

export interface CoreArgs {
  readonly baseMeta: MetadataBase;
  readonly context: string;
  readonly currentInvoice: InvoiceDto;
  readonly previousInvoice: InvoiceDto;
  readonly revenueService: RevenueService;
}

export type HandleAmountChangeParams = Readonly<{
  context: string;
  previousAmount: number;
  invoice: InvoiceDto;
  period: Period;
  revenueService: RevenueService;
}>;

export interface HandleEligibleAmountChangeArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly currentStatus: InvoiceStatus;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export interface HandleEligibleStatusChangeArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly previousStatus: InvoiceStatus;
  readonly currentStatus: InvoiceStatus;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export interface HandleNoExistingRevenueArgs {
  readonly revenueService: RevenueService;
  readonly currentInvoice: InvoiceDto;
  readonly period: PeriodArg;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export type HandleStatusChangeParams = Readonly<{
  context: string;
  eventId: string;
  previousInvoice: InvoiceDto;
  currentInvoice: InvoiceDto;
  revenueService: RevenueService;
}>;

export interface HandleTransitionFromEligibleToIneligibleArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly previousAmount: number;
  readonly previousStatus: InvoiceStatus;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly context: string;
  readonly meta: MetadataWithPeriod & {
    readonly existingCount: number;
    readonly existingTotal: number;
  };
}

export interface HandleTransitionFromIneligibleToEligibleArgs {
  readonly revenueService: RevenueService;
  readonly revenueId: string;
  readonly currentCount: number;
  readonly currentTotal: number;
  readonly currentPaidTotal: number;
  readonly currentPendingTotal: number;
  readonly currentAmount: number;
  readonly currentStatus: InvoiceStatus;
  readonly context: string;
  readonly meta: MetadataWithPeriod;
}

export interface MetadataBase extends LogMetadata {
  readonly currentStatus: InvoiceDto["status"];
  readonly invoice: InvoiceDto["id"];
  readonly previousStatus: InvoiceDto["status"];
}

export interface MetadataWithPeriod extends MetadataBase {
  readonly period: string; // periodKey string
}

export type PeriodArg = Period;
