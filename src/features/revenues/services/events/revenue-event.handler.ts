/**
 * Event handler for revenue-related invoice events.
 *
 * This class handles invoice events (created, updated, deleted) and updates
 * revenue records accordingly, ensuring revenue data stays in sync with invoices.
 */

import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  extractPeriodFromInvoice,
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
    try {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceCreated",
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        message: "Processing invoice created event",
      });

      // Extract the invoice from the event
      const invoice = event.invoice;

      // Check if the invoice is eligible for revenue calculation
      if (!this.isInvoiceEligibleForRevenue(invoice, "handleInvoiceCreated")) {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceCreated",
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Invoice not eligible for revenue calculation, skipping",
        });
        return;
      }

      // Extract the period from the invoice
      const period = extractPeriodFromInvoice(invoice);

      if (!period) {
        logger.error({
          context: "RevenueEventHandler.handleInvoiceCreated",
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Failed to extract period from invoice",
        });
        return;
      }

      // Process the invoice for revenue calculation
      await this.processInvoiceForRevenue(invoice, period);

      logger.info({
        context: "RevenueEventHandler.handleInvoiceCreated",
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        message: "Successfully processed invoice created event",
        period,
      });
    } catch (error) {
      handleEventError(
        "RevenueEventHandler.handleInvoiceCreated",
        event,
        error,
      );
    }
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
    try {
      // Validate the invoice
      const validationResult = validateInvoiceForRevenue(invoice);

      if (!validationResult.valid) {
        logger.info({
          context: `RevenueEventHandler.${contextMethod}`,
          invoice: invoice?.id,
          message: `Invoice not eligible for revenue: ${validationResult.reason}`,
          reason: validationResult.reason,
        });
        return false;
      }

      // Check if the invoice has a valid amount
      if (!invoice?.amount || invoice.amount <= 0) {
        logger.info({
          context: `RevenueEventHandler.${contextMethod}`,
          invoice: invoice?.id,
          message: "Invoice has zero or negative amount, skipping",
        });
        return false;
      }

      // Check if the invoice has a valid status
      if (invoice.status !== "paid" && invoice.status !== "pending") {
        logger.info({
          context: `RevenueEventHandler.${contextMethod}`,
          invoice: invoice?.id,
          message: `Invoice status ${invoice.status} not eligible for revenue`,
          status: invoice.status,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error({
        context: `RevenueEventHandler.${contextMethod}`,
        error,
        invoice: invoice?.id,
        message: "Error checking invoice eligibility for revenue",
      });
      return false;
    }
  }

  /**
   * Processes an invoice for revenue calculation.
   *
   * @param invoice - The invoice to process
   * @param period - The period to update
   */
  private async processInvoiceForRevenue(
    invoice: InvoiceDto,
    period: string,
  ): Promise<void> {
    try {
      logger.info({
        context: "RevenueEventHandler.processInvoiceForRevenue",
        invoice: invoice.id,
        message: "Processing invoice for revenue calculation",
        period,
      });

      // Get the existing revenue record for the period
      const existingRevenue = await this.revenueService.findByPeriod(period);

      if (existingRevenue) {
        logger.info({
          context: "RevenueEventHandler.processInvoiceForRevenue",
          existingRevenue: existingRevenue.id,
          invoice: invoice.id,
          message: "Updating existing revenue record",
          period,
        });

        // Update the existing revenue record
        await this.revenueService.update(existingRevenue.id, {
          invoiceCount: existingRevenue.invoiceCount + 1,
          revenue: existingRevenue.revenue + invoice.amount,
        });
      } else {
        logger.info({
          context: "RevenueEventHandler.processInvoiceForRevenue",
          invoice: invoice.id,
          message: "Creating new revenue record",
          period,
        });

        // Create a new revenue record
        await this.revenueService.create({
          calculationSource: "invoice_event",
          createdAt: new Date(),
          invoiceCount: 1,
          period,
          revenue: invoice.amount,
          updatedAt: new Date(),
        });
      }

      logger.info({
        context: "RevenueEventHandler.processInvoiceForRevenue",
        invoice: invoice.id,
        message: "Successfully processed invoice for revenue",
        period,
      });
    } catch (error) {
      logger.error({
        context: "RevenueEventHandler.processInvoiceForRevenue",
        error,
        invoice: invoice.id,
        message: "Error processing invoice for revenue",
        period,
      });
      throw error;
    }
  }

  /**
   * Handles invoice updated events.
   *
   * @param event - The invoice updated event
   */
  private async handleInvoiceUpdated(event: BaseInvoiceEvent): Promise<void> {
    try {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceUpdated",
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        message: "Processing invoice updated event",
      });

      // Extract the current and previous invoice states
      const currentInvoice = event.invoice;
      const previousInvoice = event.previousInvoice;

      // Check if both invoice states are available
      if (!currentInvoice || !previousInvoice) {
        logger.error({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          currentInvoice: !!currentInvoice,
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Missing current or previous invoice state",
          previousInvoice: !!previousInvoice,
        });
        return;
      }

      // Check if the status has changed
      if (previousInvoice.status !== currentInvoice.status) {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          currentStatus: currentInvoice.status,
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Invoice status changed, adjusting revenue",
          previousStatus: previousInvoice.status,
        });

        // Adjust revenue based on status change
        await this.adjustRevenueForStatusChange(
          previousInvoice,
          currentInvoice,
        );
      } else if (previousInvoice.amount !== currentInvoice.amount) {
        // If only the amount has changed, handle it as a simple update
        logger.info({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          currentAmount: currentInvoice.amount,
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Invoice amount changed, adjusting revenue",
          previousAmount: previousInvoice.amount,
        });

        // Extract the period from the current invoice
        const period = extractPeriodFromInvoice(currentInvoice);

        if (!period) {
          logger.error({
            context: "RevenueEventHandler.handleInvoiceUpdated",
            eventId: event.eventId,
            invoiceId: event.invoice.id,
            message: "Failed to extract period from invoice",
          });
          return;
        }

        // Get the existing revenue record
        const existingRevenue = await this.revenueService.findByPeriod(period);

        if (existingRevenue) {
          // Calculate the amount difference
          const amountDifference =
            currentInvoice.amount - previousInvoice.amount;

          // Update the revenue record with the new amount
          await this.revenueService.update(existingRevenue.id, {
            revenue: existingRevenue.revenue + amountDifference,
          });

          logger.info({
            amountDifference,
            context: "RevenueEventHandler.handleInvoiceUpdated",
            eventId: event.eventId,
            invoiceId: event.invoice.id,
            message: "Updated revenue record with new amount",
            period,
            revenueId: existingRevenue.id,
          });
        }
      } else {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "No relevant changes for revenue calculation",
        });
      }

      logger.info({
        context: "RevenueEventHandler.handleInvoiceUpdated",
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        message: "Successfully processed invoice updated event",
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
   * Adjusts revenue based on invoice status changes.
   *
   * @param previousInvoice - The previous invoice state
   * @param currentInvoice - The current invoice state
   */
  private async adjustRevenueForStatusChange(
    previousInvoice: InvoiceDto,
    currentInvoice: InvoiceDto,
  ): Promise<void> {
    try {
      logger.info({
        context: "RevenueEventHandler.adjustRevenueForStatusChange",
        currentStatus: currentInvoice.status,
        invoice: currentInvoice.id,
        message: "Adjusting revenue for status change",
        previousStatus: previousInvoice.status,
      });

      // Extract the period from the invoice
      const period = extractPeriodFromInvoice(currentInvoice);

      if (!period) {
        logger.error({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoice: currentInvoice.id,
          message: "Failed to extract period from invoice",
        });
        return;
      }

      // Get the existing revenue record
      const existingRevenue = await this.revenueService.findByPeriod(period);

      if (!existingRevenue) {
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoice: currentInvoice.id,
          message: "No existing revenue record found for period",
          period,
        });

        // If the current status is eligible for revenue, create a new record
        if (
          currentInvoice.status === "paid" ||
          currentInvoice.status === "pending"
        ) {
          await this.processInvoiceForRevenue(currentInvoice, period);
        }

        return;
      }

      // Handle status changes
      if (
        (previousInvoice.status === "paid" ||
          previousInvoice.status === "pending") &&
        currentInvoice.status !== "paid" &&
        currentInvoice.status !== "pending"
      ) {
        // Invoice is no longer eligible for revenue, remove it
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoice: currentInvoice.id,
          message:
            "Invoice no longer eligible for revenue, removing from total",
          period,
        });

        await this.revenueService.update(existingRevenue.id, {
          invoiceCount: Math.max(0, existingRevenue.invoiceCount - 1),
          revenue: Math.max(
            0,
            existingRevenue.revenue - previousInvoice.amount,
          ),
        });
      } else if (
        previousInvoice.status !== "paid" &&
        previousInvoice.status !== "pending" &&
        (currentInvoice.status === "paid" ||
          currentInvoice.status === "pending")
      ) {
        // Invoice is now eligible for revenue, add it
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoice: currentInvoice.id,
          message: "Invoice now eligible for revenue, adding to total",
          period,
        });

        await this.revenueService.update(existingRevenue.id, {
          invoiceCount: existingRevenue.invoiceCount + 1,
          revenue: existingRevenue.revenue + currentInvoice.amount,
        });
      } else {
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoice: currentInvoice.id,
          message: "Status change does not affect revenue eligibility",
          period,
        });
      }

      logger.info({
        context: "RevenueEventHandler.adjustRevenueForStatusChange",
        invoice: currentInvoice.id,
        message: "Successfully adjusted revenue for status change",
        period,
      });
    } catch (error) {
      logger.error({
        context: "RevenueEventHandler.adjustRevenueForStatusChange",
        error,
        invoice: currentInvoice.id,
        message: "Error adjusting revenue for status change",
      });
      throw error;
    }
  }

  /**
   * Handles invoice deleted events.
   *
   * @param event - The invoice deleted event
   */
  private async handleInvoiceDeleted(event: BaseInvoiceEvent): Promise<void> {
    try {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceDeleted",
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        message: "Processing invoice deleted event",
      });

      // Extract the deleted invoice
      const deletedInvoice = event.invoice;

      // Check if the invoice is available
      if (!deletedInvoice) {
        logger.error({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Missing deleted invoice data",
        });
        return;
      }

      // Check if the invoice was eligible for revenue
      if (
        !this.isInvoiceEligibleForRevenue(
          deletedInvoice,
          "handleInvoiceDeleted",
        )
      ) {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Deleted invoice was not eligible for revenue, skipping",
        });
        return;
      }

      // Extract the period from the invoice
      const period = extractPeriodFromInvoice(deletedInvoice);

      if (!period) {
        logger.error({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          eventId: event.eventId,
          invoiceId: event.invoice.id,
          message: "Failed to extract period from deleted invoice",
        });
        return;
      }

      // Adjust revenue for the deleted invoice
      await this.adjustRevenueForDeletedInvoice(deletedInvoice, period);

      logger.info({
        context: "RevenueEventHandler.handleInvoiceDeleted",
        eventId: event.eventId,
        invoiceId: event.invoice.id,
        message: "Successfully processed invoice deleted event",
        period,
      });
    } catch (error) {
      handleEventError(
        "RevenueEventHandler.handleInvoiceDeleted",
        event,
        error,
      );
    }
  }

  /**
   * Adjusts revenue for a deleted invoice.
   *
   * @param invoice - The deleted invoice
   * @param period - The period to update
   */
  private async adjustRevenueForDeletedInvoice(
    invoice: InvoiceDto,
    period: string,
  ): Promise<void> {
    try {
      logger.info({
        context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
        invoice: invoice.id,
        message: "Adjusting revenue for deleted invoice",
        period,
      });

      // Get the existing revenue record
      const existingRevenue = await this.revenueService.findByPeriod(period);

      if (!existingRevenue) {
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
          invoice: invoice.id,
          message: "No existing revenue record found for period",
          period,
        });
        return;
      }

      // Calculate the new invoice count and revenue
      const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
      const newRevenue = Math.max(0, existingRevenue.revenue - invoice.amount);

      logger.info({
        context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
        invoice: invoice.id,
        message: "Calculated new revenue values",
        newInvoiceCount,
        newRevenue,
        period,
        previousInvoiceCount: existingRevenue.invoiceCount,
        previousRevenue: existingRevenue.revenue,
      });

      // If there are no more invoices for this period, delete the revenue record
      if (newInvoiceCount === 0) {
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
          invoice: invoice.id,
          message: "No more invoices for period, deleting revenue record",
          period,
          revenueId: existingRevenue.id,
        });

        await this.revenueService.delete(existingRevenue.id);
      } else {
        // Otherwise, update the revenue record
        logger.info({
          context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
          invoice: invoice.id,
          message: "Updating revenue record with new values",
          newInvoiceCount,
          newRevenue,
          period,
          revenueId: existingRevenue.id,
        });

        await this.revenueService.update(existingRevenue.id, {
          invoiceCount: newInvoiceCount,
          revenue: newRevenue,
        });
      }

      logger.info({
        context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
        invoice: invoice.id,
        message: "Successfully adjusted revenue for deleted invoice",
        period,
      });
    } catch (error) {
      logger.error({
        context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
        error,
        invoice: invoice.id,
        message: "Error adjusting revenue for deleted invoice",
        period,
      });
      throw error;
    }
  }
}
