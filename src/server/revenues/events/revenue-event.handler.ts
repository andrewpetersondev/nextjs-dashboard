import "server-only";

import { periodKey } from "@/features/revenues/lib/date/period";
import { EventBus } from "@/server/events/event-bus";
import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { INVOICE_EVENTS } from "@/server/events/invoice/invoice-event.types";
import { serverLogger } from "@/server/logging/serverLogger";
import { adjustRevenueForDeletedInvoice } from "@/server/revenues/events/adjust-revenue-for-deleted-invoice";
import { adjustRevenueForStatusChange } from "@/server/revenues/events/adjust-revenue-for-status-change";
import { logError, logInfo } from "@/server/revenues/events/logging";
import { processInvoiceEvent } from "@/server/revenues/events/orchestrator";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
import { updateRevenueRecord } from "@/server/revenues/events/revenue-mutations";
import type { RevenueService } from "@/server/revenues/services/revenue.service";

/**
 * Handles invoice events and updates revenue records accordingly.
 *
 * This class subscribes to invoice events (created, updated, deleted) and
 * updates revenue records to ensure revenue data stays in sync with invoices.
 *
 * @remarks
 * **Event-Driven Architecture:**
 * - Subscribes to invoice events via the EventBus
 * - Processes events to update revenue records
 * - Maintains revenue data consistency with invoice changes
 * - Implements idempotent event handling for reliability
 */
export class RevenueEventHandler {
  /**
   * Creates a new instance of the RevenueEventHandler.
   *
   * @param revenueService - The service for managing revenue records
   */
  constructor(private readonly revenueService: RevenueService) {
    serverLogger.info({
      context: "RevenueEventHandler.constructor",
      message: "Initializing revenue event handler",
    });

    // Set up event subscriptions
    this.setupEventSubscriptions();
  }

  /**
   * Sets up subscriptions to invoice events.
   */
  private setupEventSubscriptions(): void {
    serverLogger.info({
      context: "RevenueEventHandler.setupEventSubscriptions",
      message: "Setting up event subscriptions",
    });

    // Subscribe to invoice events using centralized constants (DRY)
    EventBus.subscribe(
      INVOICE_EVENTS.CREATED,
      this.handleInvoiceCreated.bind(this),
    );
    EventBus.subscribe(
      INVOICE_EVENTS.UPDATED,
      this.handleInvoiceUpdated.bind(this),
    );
    EventBus.subscribe(
      INVOICE_EVENTS.DELETED,
      this.handleInvoiceDeleted.bind(this),
    );

    serverLogger.info({
      context: "RevenueEventHandler.setupEventSubscriptions",
      message: "Event subscriptions set up successfully",
    });
  }

  /**
   * Handles invoice created events.
   *
   * @param event - The invoice created event
   */
  private async handleInvoiceCreated(event: BaseInvoiceEvent): Promise<void> {
    await processInvoiceEvent(
      event,
      this.revenueService,
      "handleInvoiceCreated",
      (invoice, period) =>
        processInvoiceForRevenue(this.revenueService, invoice, period),
    );
  }

  /**
   * Handles invoice updated events.
   *
   * @param event - The invoice updated event
   */
  private async handleInvoiceUpdated(event: BaseInvoiceEvent): Promise<void> {
    await processInvoiceEvent(
      event,
      this.revenueService,
      "handleInvoiceUpdated",
      async (invoice, period) =>
        this.processInvoiceUpdated(event, invoice, period),
    );
  }

  /**
   * Core logic for processing an invoice update within processInvoiceEvent callback.
   * Extracted to keep handleInvoiceUpdated concise and under 50 lines.
   */
  private async processInvoiceUpdated(
    event: BaseInvoiceEvent,
    invoice: Parameters<typeof processInvoiceForRevenue>[1],
    period: Parameters<typeof processInvoiceForRevenue>[2],
  ): Promise<void> {
    const context = "RevenueEventHandler.handleInvoiceUpdated";
    const previousInvoice = event.previousInvoice;

    if (!previousInvoice) {
      this.logMissingPrevious(context, event.eventId, invoice.id);
      return;
    }

    if (previousInvoice.status !== invoice.status) {
      await this.handleStatusChange(
        context,
        event.eventId,
        previousInvoice,
        invoice,
      );
      return;
    }

    if (previousInvoice.amount !== invoice.amount) {
      await this.handleAmountChange(
        context,
        previousInvoice.amount,
        invoice,
        period,
      );
      return;
    }

    this.logNoRelevantChange(context, event.eventId, invoice.id);
  }

  private logMissingPrevious(
    context: string,
    eventId: string,
    invoiceId: string,
  ): void {
    logError(
      context,
      "Missing previous invoice state",
      new Error("Invalid invoice update event"),
      { eventId, invoiceId },
    );
  }

  private async handleStatusChange(
    context: string,
    eventId: string,
    previousInvoice: Parameters<typeof adjustRevenueForStatusChange>[1],
    currentInvoice: Parameters<typeof adjustRevenueForStatusChange>[2],
  ): Promise<void> {
    logInfo(context, "Invoice status changed, adjusting revenue", {
      currentStatus: currentInvoice.status,
      eventId,
      invoiceId: currentInvoice.id,
      previousStatus: previousInvoice.status,
    });
    await adjustRevenueForStatusChange(
      this.revenueService,
      previousInvoice,
      currentInvoice,
    );
  }

  private async handleAmountChange(
    context: string,
    previousAmount: number,
    invoice: Parameters<typeof processInvoiceForRevenue>[1],
    period: Parameters<typeof processInvoiceForRevenue>[2],
  ): Promise<void> {
    const existingRevenue = await this.revenueService.findByPeriod(period);
    if (existingRevenue) {
      const amountDifference = invoice.amount - previousAmount;
      await updateRevenueRecord(
        this.revenueService,
        existingRevenue.id,
        existingRevenue.invoiceCount,
        existingRevenue.totalAmount + amountDifference,
        context,
        { amountDifference, invoiceId: invoice.id, period: periodKey(period) },
      );
      return;
    }
    await processInvoiceForRevenue(
      this.revenueService,
      invoice,
      period,
      context,
      true,
      previousAmount,
    );
  }

  private logNoRelevantChange(
    context: string,
    eventId: string,
    invoiceId: string,
  ): void {
    logInfo(context, "No relevant changes for revenue calculation", {
      eventId,
      invoiceId,
    });
  }

  /**
   * Handles invoice deleted events.
   *
   * @param event - The invoice deleted event
   */
  private async handleInvoiceDeleted(event: BaseInvoiceEvent): Promise<void> {
    await processInvoiceEvent(
      event,
      this.revenueService,
      "handleInvoiceDeleted",
      (invoice, period) =>
        adjustRevenueForDeletedInvoice(this.revenueService, invoice, period),
    );
  }
}
