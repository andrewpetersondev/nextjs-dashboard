import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { LogMetadata } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { Period } from "@/shared/branding/brands";

/**
 * Options for creating a brand new revenue record for a period.
 */
export type CreateNewOptions = Readonly<{
  revenueService: RevenueService;
  context: string;
  metadata: LogMetadata;
  period: Period;
  invoiceCount: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}>;

/**
 * Options for processing an invoice for revenue.
 * - isUpdate: when true, indicates this call is for an updated invoice and may include previousAmount for diffing.
 */
export type ProcessOptions = Readonly<{
  context?: string;
  isUpdate?: boolean;
  previousAmount?: number;
}>;

/**
 * Options for updating an existing revenue record when processing an invoice.
 */
export type UpdateExistingOptions = Readonly<{
  revenueService: RevenueService;
  context: string;
  existing: {
    readonly id: string;
    readonly invoiceCount: number;
    readonly totalAmount: number;
    readonly totalPaidAmount: number;
    readonly totalPendingAmount: number;
  };
  invoice: InvoiceDto;
  metadata: LogMetadata;
  isUpdate: boolean;
  previousAmount?: number;
}>;

/**
 * Arguments for updating a revenue record.
 *
 * - revenueId: string form of the revenue id
 * - invoiceCount: new invoice count for the period
 * - totalAmount: new total revenue amount for the period
 * - totalPaidAmount: new total paid amount for the period
 * - totalPendingAmount: new total pending amount for the period
 * - context: logging context
 * - metadata: structured metadata for logs
 */
export type UpdateRevenueArgs = Readonly<{
  readonly revenueId: string;
  readonly invoiceCount: number;
  readonly totalAmount: number;
  readonly totalPaidAmount: number;
  readonly totalPendingAmount: number;
  readonly context: string;
  readonly metadata?: LogMetadata;
}>;

/**
 * Arguments used when upserting a revenue record for a given period.
 */
export type UpsertArgs = Readonly<{
  context: string;
  invoice: InvoiceDto;
  isUpdate: boolean;
  metadata: LogMetadata;
  period: Period;
  previousAmount?: number;
  revenueService: RevenueService;
}>;
