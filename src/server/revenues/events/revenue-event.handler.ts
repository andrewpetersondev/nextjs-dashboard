import "server-only";

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
      async (invoice, period) => {
        const context = "RevenueEventHandler.handleInvoiceUpdated";
        const previousInvoice = event.previousInvoice;

        // Check if previous invoice state is available
        if (!previousInvoice) {
          logError(
            context,
            "Missing previous invoice state",
            new Error("Invalid invoice update event"),
            {
              eventId: event.eventId,
              invoiceId: invoice.id,
            },
          );
          return;
        }

        // Handle status change
        if (previousInvoice.status !== invoice.status) {
          logInfo(context, "Invoice status changed, adjusting revenue", {
            currentStatus: invoice.status,
            eventId: event.eventId,
            invoiceId: invoice.id,
            previousStatus: previousInvoice.status,
          });

          await adjustRevenueForStatusChange(
            this.revenueService,
            previousInvoice,
            invoice,
          );
          return;
        }

        // Handle amount change
        if (previousInvoice.amount !== invoice.amount) {
          const existingRevenue =
            await this.revenueService.findByPeriod(period);

          if (existingRevenue) {
            const amountDifference = invoice.amount - previousInvoice.amount;

            await updateRevenueRecord(
              this.revenueService,
              existingRevenue.id,
              existingRevenue.invoiceCount,
              existingRevenue.totalAmount + amountDifference,
              context,
              {
                amountDifference,
                eventId: event.eventId,
                invoiceId: invoice.id,
                period,
              },
            );
          } else {
            await processInvoiceForRevenue(
              this.revenueService,
              invoice,
              period,
              context,
              true, // This is an update
              previousInvoice.amount,
            );
          }
          return;
        }

        // No relevant changes
        logInfo(context, "No relevant changes for revenue calculation", {
          eventId: event.eventId,
          invoiceId: invoice.id,
        });
      },
    );
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
