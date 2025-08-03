import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { RevenueService } from "@/features/revenues/revenue.service";
import {
  extractPeriodFromInvoice,
  handleEventError,
  validateInvoiceForRevenue,
} from "@/features/revenues/revenue-event-utils";
import { EventBus } from "@/lib/events/eventBus";
import type { BaseInvoiceEvent } from "@/lib/events/invoice.events";
import { logger } from "@/lib/utils/logger";

/**
 * Handles invoice events and determines if revenue recalculation is needed.
 */
export class RevenueEventHandler {
  private readonly revenueService: RevenueService;

  /**
   * Constructor using dependency injection pattern.
   *
   * @remarks
   * **Dependency Injection Benefits:**
   * - Testable through mock service injection
   * - Clear separation of event handling from business logic
   * - Follows dependency inversion principle
   * - Eliminates tight coupling to concrete implementations
   *
   * @param revenueService - Service instance for revenue operations
   */
  constructor(revenueService: RevenueService) {
    this.revenueService = revenueService;
    this.setupEventSubscriptions();
  }

  /**
   * Sets up event subscriptions for invoice events.
   * Separated from constructor to improve testability.
   *
   * @private
   */
  private setupEventSubscriptions(): void {
    EventBus.subscribe<BaseInvoiceEvent>(
      "InvoiceCreatedEvent",
      this.handleInvoiceCreated.bind(this),
    );

    EventBus.subscribe<BaseInvoiceEvent>(
      "InvoiceUpdatedEvent",
      this.handleInvoiceUpdated.bind(this),
    );

    EventBus.subscribe<BaseInvoiceEvent>(
      "InvoiceDeletedEvent",
      this.handleInvoiceDeleted.bind(this),
    );
  }

  private async handleInvoiceCreated(event: BaseInvoiceEvent): Promise<void> {
    try {
      // Validate the invoice
      const validation = validateInvoiceForRevenue(event.invoice);
      if (!validation.isValid) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice?.id,
          message: validation.errorMessage || "Invalid invoice parameters",
        });
        return; // Skip if invoice validation fails
      }

      // Skip if the invoice is not paid
      if (event.invoice.status !== "paid") {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice.id,
          message: "Invoice status is not 'paid', skipping revenue calculation",
        });
        return;
      }

      // Extract period safely
      const period = extractPeriodFromInvoice(event.invoice);
      if (!period) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice.id,
          message: "Could not extract valid period from invoice date",
        });
        return;
      }

      // Log the creation event
      logger.info({
        amount: event.invoice.amount,
        context: "RevenueEventHandler.handleInvoiceCreated",
        invoiceId: event.invoice.id,
        period,
        status: event.invoice.status,
      });

      // Check if a revenue record already exists for the period
      const existingRevenue =
        await this.revenueService.getRevenueByPeriod(period);

      // If no existing revenue, create a new record
      if (!existingRevenue) {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice.id,
          message:
            "No existing revenue record found, creating new revenue record",
          period,
        });

        const revenue = {
          calculationSource: "handler",
          createdAt: new Date(),
          invoiceCount: 1,
          period,
          revenue: event.invoice.amount,
          updatedAt: new Date(),
        };

        await this.revenueService.createRevenue(revenue);
        return; // Exit early since we've created a new record
      }

      // If existing revenue has zero values, create a new record
      if (existingRevenue.invoiceCount === 0 && existingRevenue.revenue === 0) {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice.id,
          message: "Existing revenue record has zero values, updating record",
          period,
        });

        const revenue = {
          calculationSource: "handler",
          createdAt: existingRevenue.createdAt,
          invoiceCount: 1,
          period: existingRevenue.period,
          revenue: event.invoice.amount,
          updatedAt: new Date(),
        };

        await this.revenueService.updateRevenue(existingRevenue.id, revenue);
        return;
      }

      // If existing revenue has non-zero values, update the record
      if (existingRevenue.invoiceCount > 0 || existingRevenue.revenue > 0) {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice.id,
          message:
            "Existing revenue record found, updating existing revenue record",
          period,
        });

        const revenue = {
          calculationSource: "handler",
          createdAt: existingRevenue.createdAt,
          invoiceCount: existingRevenue.invoiceCount + 1,
          period: existingRevenue.period,
          revenue: existingRevenue.revenue + event.invoice.amount,
          updatedAt: new Date(),
        };

        await this.revenueService.updateRevenue(existingRevenue.id, revenue);
      }
    } catch (error) {
      handleEventError("RevenueEventHandler.handleInvoiceCreated", error, {
        invoiceId: event.invoice?.id,
      });
    }
  }

  private async handleInvoiceUpdated(event: BaseInvoiceEvent): Promise<void> {
    try {
      // Validate the invoice
      const validation = validateInvoiceForRevenue(event.invoice);
      if (!validation.isValid) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          invoiceId: event.invoice?.id,
          message: validation.errorMessage || "Invalid invoice parameters",
        });
        return;
      }

      const statusChanged =
        event.previousInvoice?.status !== event.invoice.status;
      const amountChanged =
        event.previousInvoice?.amount !== event.invoice.amount;

      // Only recalculate if status changed or amount changed for paid invoices
      if (statusChanged || (amountChanged && event.invoice.status === "paid")) {
        logger.info({
          amountChanged,
          context: "RevenueEventHandler.handleInvoiceUpdated",
          invoiceId: event.invoice.id,
          previousAmount: event.previousInvoice?.amount,
          previousStatus: event.previousInvoice?.status,
          statusChanged,
        });

        await this.recalculateRevenue(event.invoice);
      } else {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          invoiceId: event.invoice.id,
          message:
            "No relevant changes detected, skipping revenue recalculation",
        });
      }
    } catch (error) {
      handleEventError("RevenueEventHandler.handleInvoiceUpdated", error, {
        invoiceId: event.invoice?.id,
      });
    }
  }

  private async recalculateRevenue(invoice: InvoiceDto): Promise<void> {
    try {
      // Extract period safely
      const period = extractPeriodFromInvoice(invoice);
      if (!period) {
        logger.warn({
          context: "RevenueEventHandler.recalculateRevenue",
          invoiceId: invoice.id,
          message: "Could not extract valid period from invoice date",
        });
        return;
      }

      // Create or update monthly revenue record
      await this.revenueService.upsertMonthlyRevenue(period, invoice);

      logger.info({
        amount: invoice.amount,
        context: "RevenueEventHandler.recalculateRevenue",
        invoiceId: invoice.id,
        period,
        status: invoice.status,
      });
    } catch (error) {
      handleEventError("RevenueEventHandler.recalculateRevenue", error, {
        invoiceId: invoice.id,
      });
    }
  }

  /**
   * Handles invoice deletion events by updating the corresponding revenue record.
   * When an invoice is deleted, we need to decrement the invoice count and subtract
   * the invoice amount from the revenue total for the affected period.
   *
   * @param event - The invoice deletion event containing the deleted invoice data
   */
  private async handleInvoiceDeleted(event: BaseInvoiceEvent): Promise<void> {
    try {
      // Validate the invoice
      const validation = validateInvoiceForRevenue(event.invoice);
      if (!validation.isValid) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          invoiceId: event.invoice?.id,
          message: validation.errorMessage || "Invalid invoice parameters",
        });
        return;
      }

      // Only paid invoices affect revenue
      if (event.invoice.status !== "paid") {
        logger.info({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          invoiceId: event.invoice.id,
          message: "Deleted invoice was not paid, no revenue adjustment needed",
        });
        return;
      }

      // Extract period safely
      const period = extractPeriodFromInvoice(event.invoice);
      if (!period) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          invoiceId: event.invoice.id,
          message: "Could not extract valid period from invoice date",
        });
        return;
      }

      // Get the existing revenue record for this period
      const existingRevenue =
        await this.revenueService.getRevenueByPeriod(period);

      if (!existingRevenue) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          invoiceId: event.invoice.id,
          message:
            "No revenue record found for the period of the deleted invoice",
          period,
        });
        return;
      }

      // Calculate new values after removing the deleted invoice
      const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
      const newRevenue = Math.max(
        0,
        existingRevenue.revenue - event.invoice.amount,
      );

      // Update the revenue record
      const updatedRevenue = {
        calculationSource: "handler",
        createdAt: existingRevenue.createdAt,
        invoiceCount: newInvoiceCount,
        period: existingRevenue.period,
        revenue: newRevenue,
        updatedAt: new Date(),
      };

      await this.revenueService.updateRevenue(
        existingRevenue.id,
        updatedRevenue,
      );

      logger.info({
        context: "RevenueEventHandler.handleInvoiceDeleted",
        invoiceId: event.invoice.id,
        message: "Revenue record updated after invoice deletion",
        newInvoiceCount,
        newRevenue,
        period,
      });
    } catch (error) {
      handleEventError("RevenueEventHandler.handleInvoiceDeleted", error, {
        invoiceId: event.invoice?.id,
      });
    }
  }
}
