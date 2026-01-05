import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import type { LogMetadata } from "@/modules/revenues/application/cross-cutting/logging";
import type { RevenueService } from "@/modules/revenues/application/services/revenue.service";
import type { Period } from "@/shared/branding/brands";

/**
 * Arguments for applying deletion effects to revenue records.
 */
export type ApplyDeletionEffectsArgs = Readonly<{
  context: string;
  invoice: InvoiceDto;
  metadata: LogMetadata;
  period: Period;
  revenueService: RevenueService;
}>;
