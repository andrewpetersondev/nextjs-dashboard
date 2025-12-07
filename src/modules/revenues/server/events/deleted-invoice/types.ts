import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { LogMetadata } from "@/modules/revenues/server/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import type { Period } from "@/shared/branding/brands";

/**
 * Options required to apply deletion effects to revenue records.
 */
export type ApplyDeletionOptions = Readonly<{
  revenueService: RevenueService;
  invoice: InvoiceDto;
  period: Period;
  context: string;
  metadata: LogMetadata;
}>;
