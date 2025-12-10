import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import type { LogMetadata } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { Period } from "@/shared/branding/brands";

/**
 * Arguments for creating a new revenue record.
 */
export type CreateRevenueArgs = Readonly<{
  context: string;
  invoiceCount: number;
  metadata: LogMetadata;
  period: Period;
  revenueService: RevenueService;
  totalAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}>;

/**
 * Options for processing invoice upsert operations.
 */
export type ProcessInvoiceOptions = Readonly<{
  context?: string;
  isUpdate?: boolean;
  previousAmount?: number;
}>;

/**
 * Existing revenue record data.
 */
export type ExistingRevenueData = Readonly<{
  id: string;
  invoiceCount: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}>;

/**
 * Arguments for updating an existing revenue record.
 */
export type UpdateExistingRevenueArgs = Readonly<{
  context: string;
  existing: ExistingRevenueData;
  invoice: InvoiceDto;
  isUpdate: boolean;
  metadata: LogMetadata;
  previousAmount?: number;
  revenueService: RevenueService;
}>;

/**
 * Arguments for updating a revenue record.
 */
export type UpdateRevenueRecordArgs = Readonly<{
  context: string;
  invoiceCount: number;
  metadata?: LogMetadata;
  revenueId: string;
  totalAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}>;

/**
 * Arguments for upserting revenue.
 */
export type UpsertRevenueArgs = Readonly<{
  context: string;
  invoice: InvoiceDto;
  isUpdate: boolean;
  metadata: LogMetadata;
  period: Period;
  previousAmount?: number;
  revenueService: RevenueService;
}>;
