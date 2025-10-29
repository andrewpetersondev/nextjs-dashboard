import "server-only";

import { EventBus } from "@/server/events/event-bus";
import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { INVOICE_EVENTS } from "@/server/events/invoice/invoice-event.types";
import { processInvoiceEvent } from "@/server/revenues/application/handlers/events/orchestrator";
import type { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { adjustRevenueForDeletedInvoice } from "@/server/revenues/events/deleted-invoice/adjust-revenue-for-deleted-invoice";
import { processInvoiceUpdated } from "@/server/revenues/events/process-invoice/handlers/invoice-update.handlers";
import { processInvoiceForRevenue } from "@/server/revenues/events/process-invoice/process-invoice-for-revenue";
import { sharedLogger } from "@/shared/logging/logger.shared";

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

    sharedLogger.debug({
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
    sharedLogger.info({
      context: "RevenueEventHandler.setupEventSubscriptions",
      message: "Setting up event subscriptions",
    });

    // Subscribe to invoice events using centralized constants (DRY)
    EventBus.subscribe(
      INVOICE_EVENTS.created,
      this.handleInvoiceCreated.bind(this),
    );
    EventBus.subscribe(
      INVOICE_EVENTS.updated,
      this.handleInvoiceUpdated.bind(this),
    );
    EventBus.subscribe(
      INVOICE_EVENTS.deleted,
      this.handleInvoiceDeleted.bind(this),
    );

    sharedLogger.info({
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
