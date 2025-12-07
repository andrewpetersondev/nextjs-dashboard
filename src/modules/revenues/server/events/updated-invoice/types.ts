import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { InvoiceStatus } from "@/modules/invoices/domain/types";
import type { LogMetadata } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { ExistingRevenueData } from "@/modules/revenues/server/events/shared/types";
import type { Period } from "@/shared/branding/brands";

/**
 * Types of invoice changes that affect revenue.
 */
export type ChangeType =
  | "eligible-to-ineligible"
  | "ineligible-to-eligible"
  | "eligible-status-change"
  | "eligible-amount-change"
  | "none";

/**
 * Base metadata for invoice updates.
 */
export type BaseMetadata = LogMetadata &
  Readonly<{
    currentStatus: InvoiceDto["status"];
    invoice: InvoiceDto["id"];
    previousStatus: InvoiceDto["status"];
  }>;

/**
 * Metadata with period information.
 */
export type MetadataWithPeriod = BaseMetadata &
  Readonly<{
    period: string;
  }>;

/**
 * Period argument type.
 */
export type PeriodArg = Period;

/**
 * Core arguments for status change processing.
 */
export type CoreArgs = Readonly<{
  baseMeta: BaseMetadata;
  context: string;
  currentInvoice: InvoiceDto;
  previousInvoice: InvoiceDto;
  revenueService: RevenueService;
}>;

/**
 * Arguments for handling status changes.
 */
export type HandleStatusChangeParams = Readonly<{
  context: string;
  currentInvoice: InvoiceDto;
  eventId: string;
  previousInvoice: InvoiceDto;
  revenueService: RevenueService;
}>;

/**
 * Arguments for handling amount changes.
 */
export type HandleAmountChangeParams = Readonly<{
  context: string;
  invoice: InvoiceDto;
  period: Period;
  previousAmount: number;
  revenueService: RevenueService;
}>;

/**
 * Arguments for dispatching change processing.
 */
export type DispatchChangeArgs = Readonly<{
  currentInvoice: InvoiceDto;
  existingRevenue?: ExistingRevenueData;
  meta: MetadataWithPeriod;
  period: Period;
  previousInvoice: InvoiceDto;
  revenueService: RevenueService;
}>;

/**
 * Arguments for eligible amount change handling.
 */
export type HandleEligibleAmountChangeArgs = Readonly<{
  context: string;
  currentAmount: number;
  currentCount: number;
  currentPaidTotal: number;
  currentPendingTotal: number;
  currentStatus: InvoiceStatus;
  currentTotal: number;
  meta: MetadataWithPeriod;
  previousAmount: number;
  revenueId: string;
  revenueService: RevenueService;
}>;

/**
 * Arguments for eligible status change handling.
 */
export type HandleEligibleStatusChangeArgs = Readonly<{
  context: string;
  currentAmount: number;
  currentCount: number;
  currentPaidTotal: number;
  currentPendingTotal: number;
  currentStatus: InvoiceStatus;
  currentTotal: number;
  meta: MetadataWithPeriod;
  previousAmount: number;
  previousStatus: InvoiceStatus;
  revenueId: string;
  revenueService: RevenueService;
}>;

/**
 * Arguments for eligible to ineligible transition.
 */
export type HandleEligibleToIneligibleArgs = Readonly<{
  context: string;
  currentPaidTotal: number;
  currentPendingTotal: number;
  meta: MetadataWithPeriod & {
    readonly existingCount: number;
    readonly existingTotal: number;
  };
  previousAmount: number;
  previousStatus: InvoiceStatus;
  revenueId: string;
  revenueService: RevenueService;
}>;

/**
 * Arguments for ineligible to eligible transition.
 */
export type HandleIneligibleToEligibleArgs = Readonly<{
  context: string;
  currentAmount: number;
  currentCount: number;
  currentPaidTotal: number;
  currentPendingTotal: number;
  currentStatus: InvoiceStatus;
  currentTotal: number;
  meta: MetadataWithPeriod;
  revenueId: string;
  revenueService: RevenueService;
}>;

/**
 * Arguments when no existing revenue record is found.
 */
export type HandleNoExistingRevenueArgs = Readonly<{
  context: string;
  currentInvoice: InvoiceDto;
  meta: MetadataWithPeriod;
  period: Period;
  revenueService: RevenueService;
}>;
