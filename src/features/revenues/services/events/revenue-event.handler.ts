import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  adjustRevenueForDeletedInvoice,
  adjustRevenueForStatusChange,
  extractAndValidatePeriod,
  handleInvoiceEvent,
  isStatusEligibleForRevenue,
  logError,
  logInfo,
  processInvoiceForRevenue,
  updateRevenueRecord,
} from "@/features/revenues/services/events/revenue-event.helpers";
import {
  handleEventError,
  validateInvoiceForRevenue,
} from "@/features/revenues/services/events/revenue-event.utils";
import type { RevenueService } from "@/features/revenues/services/revenue.service";
import { EventBus } from "@/lib/events/eventBus";
import type { BaseInvoiceEvent } from "@/lib/events/invoice.events";
import { logger } from "@/lib/utils/logger";

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
    logger.info({
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
    logger.info({
      context: "RevenueEventHandler.setupEventSubscriptions",
      message: "Setting up event subscriptions",
    });

    // Subscribe to invoice events
    EventBus.subscribe("invoice.created", this.handleInvoiceCreated.bind(this));
    EventBus.subscribe("invoice.updated", this.handleInvoiceUpdated.bind(this));
    EventBus.subscribe("invoice.deleted", this.handleInvoiceDeleted.bind(this));

    logger.info({
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
    await handleInvoiceEvent(
      event,
      this.revenueService,
      "handleInvoiceCreated",
      (invoice, context) => this.isInvoiceEligibleForRevenue(invoice, context),
      (invoice, period) =>
        processInvoiceForRevenue(this.revenueService, invoice, period),
    );
  }

  /**
   * Checks if an invoice is eligible for revenue calculation.
   *
   * @param invoice - The invoice to check
   * @param contextMethod - The method context for logging
   * @returns True if the invoice is eligible, false otherwise
   */
  private isInvoiceEligibleForRevenue(
    invoice: InvoiceDto | undefined,
    contextMethod: string,
  ): boolean {
    const context = `RevenueEventHandler.${contextMethod}`;

    try {
      // Validate the invoice
      const validationResult = validateInvoiceForRevenue(invoice);

      if (!validationResult.valid) {
        logInfo(
          context,
          `Invoice not eligible for revenue: ${validationResult.reason}`,
          {
            invoice: invoice?.id,
            reason: validationResult.reason,
          },
        );
        return false;
      }

      // Check if the invoice has a valid amount
      if (!invoice?.amount || invoice.amount <= 0) {
        logInfo(context, "Invoice has zero or negative amount, skipping", {
          invoice: invoice?.id,
        });
        return false;
      }

      // Check if the invoice has a valid status
      if (!isStatusEligibleForRevenue(invoice.status)) {
        logInfo(
          context,
          `Invoice status ${invoice.status} not eligible for revenue`,
          {
            invoice: invoice?.id,
            status: invoice.status,
          },
        );
        return false;
      }

      return true;
    } catch (error) {
      logError(
        context,
        "Error checking invoice eligibility for revenue",
        error,
        {
          invoice: invoice?.id,
        },
      );
      return false;
    }
  }

  /**
   * Handles invoice updated events.
   *
   * @param event - The invoice updated event
   */
  private async handleInvoiceUpdated(event: BaseInvoiceEvent): Promise<void> {
    try {
      const context = "RevenueEventHandler.handleInvoiceUpdated";
      logInfo(context, "Processing invoice updated event", {
        eventId: event.eventId,
        invoiceId: event.invoice.id,
      });

      // Extract the current and previous invoice states
      const currentInvoice = event.invoice;
      const previousInvoice = event.previousInvoice;

      // Check if both invoice states are available
      if (!currentInvoice || !previousInvoice) {
        logError(
          context,
          "Missing current or previous invoice state",
          undefined,
          {
            currentInvoice: !!currentInvoice,
            eventId: event.eventId,
            invoiceId: event.invoice.id,
            previousInvoice: !!previousInvoice,
          },
        );
        return;
      }

      // Check if the status has changed
      if (previousInvoice.status !== currentInvoice.status) {
        logInfo(context, "Invoice status changed, adjusting revenue", {
          currentStatus: currentInvoice.status,
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          previousStatus: previousInvoice.status,
        });

        // Adjust revenue based on status change
        await adjustRevenueForStatusChange(
          this.revenueService,
          previousInvoice,
          currentInvoice,
        );
      } else if (previousInvoice.amount !== currentInvoice.amount) {
        // If only the amount has changed, handle it as a simple update
        logInfo(context, "Invoice amount changed, adjusting revenue", {
          currentAmount: currentInvoice.amount,
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          previousAmount: previousInvoice.amount,
        });

        // Extract the period from the current invoice
        const period = extractAndValidatePeriod(
          currentInvoice,
          context,
          event.eventId,
        );

        if (!period) {
          return;
        }

        // Get the existing revenue record
        const existingRevenue = await this.revenueService.findByPeriod(period);

        if (existingRevenue) {
          // Calculate the amount difference
          const amountDifference =
            currentInvoice.amount - previousInvoice.amount;

          // Update the revenue record with the new amount
          await updateRevenueRecord(
            this.revenueService,
            existingRevenue.id,
            existingRevenue.invoiceCount,
            existingRevenue.revenue + amountDifference,
            context,
            {
              amountDifference,
              eventId: event.eventId,
              invoiceId: event.invoice.id,
              period,
            },
          );
        }
      } else {
        logInfo(context, "No relevant changes for revenue calculation", {
          eventId: event.eventId,
          invoiceId: event.invoice.id,
        });
      }

      logInfo(context, "Successfully processed invoice updated event", {
        eventId: event.eventId,
        invoiceId: event.invoice.id,
      });
    } catch (error) {
      handleEventError(
        "RevenueEventHandler.handleInvoiceUpdated",
        event,
        error,
      );
    }
  }

  /**
   * Handles invoice deleted events.
   *
   * @param event - The invoice deleted event
   */
  private async handleInvoiceDeleted(event: BaseInvoiceEvent): Promise<void> {
    await handleInvoiceEvent(
      event,
      this.revenueService,
      "handleInvoiceDeleted",
      (invoice, context) => this.isInvoiceEligibleForRevenue(invoice, context),
      (invoice, period) =>
        adjustRevenueForDeletedInvoice(this.revenueService, invoice, period),
    );
  }
}
