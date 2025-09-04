import "server-only";

import { EventBus } from "@/server/events/event-bus";
import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { INVOICE_EVENTS } from "@/server/events/invoice/invoice-event.types";
import { serverLogger } from "@/server/logging/serverLogger";
import { adjustRevenueForDeletedInvoice } from "@/server/revenues/events/adjust-revenue-for-deleted-invoice";
import { processInvoiceUpdated } from "@/server/revenues/events/handlers/invoice-update.handlers";
import { processInvoiceEvent } from "@/server/revenues/events/orchestrator";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice-for-revenue";
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
  private readonly revenueService: RevenueService;

  constructor(revenueService: RevenueService) {
    this.revenueService = revenueService;

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
        processInvoiceUpdated(event, invoice, period, this.revenueService),
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
