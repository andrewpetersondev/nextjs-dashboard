import { type Database, getDB } from "@/db/connection";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { EventBus } from "@/lib/events/eventBus";
import type { BaseInvoiceEvent } from "@/lib/events/invoice.events";
import { logger } from "@/lib/utils/logger";
import { RevenueRepository } from "./revenue.repository";
import { RevenueService } from "./revenue.service";

/**
 * Handles invoice events and determines if revenue recalculation is needed.
 */
export class RevenueEventHandler {
  private revenueService: RevenueService;

  constructor() {
    const db: Database = getDB();
    const revenueRepository = new RevenueRepository(db);

    this.revenueService = new RevenueService(revenueRepository);

    // Subscribe only to events that trigger revenue recalculation
    EventBus.subscribe<BaseInvoiceEvent>(
      "InvoiceCreatedEvent",
      this.handleInvoiceCreated.bind(this),
    );

    EventBus.subscribe<BaseInvoiceEvent>(
      "InvoiceUpdatedEvent",
      this.handleInvoiceUpdated.bind(this),
    );

    // Note: Don't subscribe to deleted events if they don't affect revenue
  }

  private async handleInvoiceCreated(event: BaseInvoiceEvent): Promise<void> {
    if (event.invoice.status === "paid") {
      await this.recalculateRevenue(event.invoice);
    }
  }

  private async handleInvoiceUpdated(event: BaseInvoiceEvent): Promise<void> {
    const statusChanged =
      event.previousInvoice?.status !== event.invoice.status;
    const amountChanged =
      event.previousInvoice?.amount !== event.invoice.amount;

    if (statusChanged || (amountChanged && event.invoice.status === "paid")) {
      await this.recalculateRevenue(event.invoice);
    }
  }

  private async recalculateRevenue(invoice: InvoiceDto): Promise<void> {
    // Implement actual revenue recalculation logic
    logger.info({
      amount: invoice.amount,
      context: "RevenueEventHandler.recalculateRevenue",
      invoiceId: invoice.id,
      status: invoice.status,
    });
  }
}
