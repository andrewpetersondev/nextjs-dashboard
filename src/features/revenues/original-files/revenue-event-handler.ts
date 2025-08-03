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

  /**
   * Handles invoice creation events by updating the corresponding revenue record.
   * When a paid invoice is created, we need to increment the invoice count and add
   * the invoice amount to the revenue total for the affected period.
   *
   * @param event - The invoice creation event containing the new invoice data
   */
  private async handleInvoiceCreated(event: BaseInvoiceEvent): Promise<void> {
    try {
      // Validate the invoice and check if it's eligible for revenue calculation
      if (
        !this.isInvoiceEligibleForRevenue(event.invoice, "handleInvoiceCreated")
      ) {
        return;
      }

      const period = extractPeriodFromInvoice(event.invoice);

      if (!period) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceCreated",
          invoiceId: event.invoice.id,
          message: "Could not extract period from invoice date",
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

      // Process the invoice for revenue calculation
      await this.processInvoiceForRevenue(event.invoice, period);
    } catch (error) {
      handleEventError("RevenueEventHandler.handleInvoiceCreated", error, {
        invoiceId: event.invoice?.id,
      });
    }
  }

  /**
   * Validates if an invoice is eligible for revenue calculation.
   * An invoice is eligible if it's valid, paid, and has a valid period.
   *
   * @param invoice - The invoice to validate
   * @param contextMethod - The name of the calling method for logging context
   * @returns True if the invoice is eligible, false otherwise
   * @private
   */
  private isInvoiceEligibleForRevenue(
    invoice: InvoiceDto | undefined,
    contextMethod: string,
  ): boolean {
    // Check if invoice exists
    if (!invoice) {
      logger.warn({
        context: `RevenueEventHandler.${contextMethod}`,
        message: "Invoice is undefined or null",
      });
      return false;
    }

    // Validate the invoice
    const validation = validateInvoiceForRevenue(invoice);
    if (!validation.isValid) {
      logger.warn({
        context: `RevenueEventHandler.${contextMethod}`,
        invoiceId: invoice.id,
        message: validation.errorMessage || "Invalid invoice parameters",
      });
      return false;
    }

    // Skip if the invoice is not paid
    if (invoice!.status !== "paid") {
      logger.info({
        context: `RevenueEventHandler.${contextMethod}`,
        invoiceId: invoice!.id,
        message: "Invoice status is not 'paid', skipping revenue calculation",
      });
      return false;
    }

    // Extract period safely
    const period = extractPeriodFromInvoice(invoice);
    if (!period) {
      logger.warn({
        context: `RevenueEventHandler.${contextMethod}`,
        invoiceId: invoice!.id,
        message: "Could not extract valid period from invoice date",
      });
      return false;
    }

    return true;
  }

  /**
   * Processes an invoice for revenue calculation by creating or updating the revenue record.
   *
   * @param invoice - The invoice to process
   * @param period - The period (YYYY-MM) to associate with the revenue
   * @private
   */
  private async processInvoiceForRevenue(
    invoice: InvoiceDto,
    period: string,
  ): Promise<void> {
    // Check if a revenue record already exists for the period
    const existingRevenue =
      await this.revenueService.getRevenueByPeriod(period);

    // If no existing revenue, create a new record
    if (!existingRevenue) {
      logger.info({
        context: "RevenueEventHandler.processInvoiceForRevenue",
        invoiceId: invoice.id,
        message:
          "No existing revenue record found, creating new revenue record",
        period,
      });

      const revenue = {
        calculationSource: "handler",
        createdAt: new Date(),
        invoiceCount: 1,
        period,
        revenue: invoice.amount,
        updatedAt: new Date(),
      };

      await this.revenueService.createRevenue(revenue);
      return;
    }

    // For existing revenue records (with zero or non-zero values), update the record
    const logMessage =
      existingRevenue.invoiceCount === 0 && existingRevenue.revenue === 0
        ? "Existing revenue record has zero values, updating record"
        : "Existing revenue record found, updating existing revenue record";

    logger.info({
      context: "RevenueEventHandler.processInvoiceForRevenue",
      invoiceId: invoice.id,
      message: logMessage,
      period,
    });

    const revenue = {
      calculationSource: "handler",
      createdAt: existingRevenue.createdAt,
      invoiceCount: existingRevenue.invoiceCount + 1,
      period: existingRevenue.period,
      revenue: existingRevenue.revenue + invoice.amount,
      updatedAt: new Date(),
    };

    await this.revenueService.updateRevenue(existingRevenue.id, revenue);
  }

  /**
   * Handles invoice update events by recalculating revenue if necessary.
   * Revenue recalculation is needed when:
   * 1. The invoice status changes (e.g., from draft to paid)
   * 2. The amount changes for a paid invoice
   *
   * @param event - The invoice update event containing the updated invoice data
   */
  private async handleInvoiceUpdated(event: BaseInvoiceEvent): Promise<void> {
    try {
      // According to the BaseInvoiceEvent interface, invoice should always be defined
      // But we'll add a safety check just in case
      if (!event.invoice) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          message: "Event invoice is undefined or null",
        });
        return;
      }

      // Validate the invoice
      const validation = validateInvoiceForRevenue(event.invoice);
      if (!validation.isValid) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceUpdated",
          invoiceId: event.invoice.id,
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

        // If the invoice is now paid, process it for revenue calculation
        if (event.invoice.status === "paid") {
          const period = extractPeriodFromInvoice(event.invoice);
          if (period) {
            await this.processInvoiceForRevenue(event.invoice, period);
          } else {
            logger.warn({
              context: "RevenueEventHandler.handleInvoiceUpdated",
              invoiceId: event.invoice.id,
              message: "Could not extract valid period from invoice date",
            });
          }
        }
        // If the invoice was previously paid but is no longer paid, adjust revenue
        else if (event.previousInvoice?.status === "paid") {
          await this.adjustRevenueForStatusChange(
            event.previousInvoice,
            event.invoice,
          );
        }
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

  /**
   * Adjusts revenue when an invoice status changes from paid to unpaid.
   * This decrements the invoice count and subtracts the invoice amount from the revenue.
   *
   * @param previousInvoice - The previous state of the invoice (paid)
   * @param currentInvoice - The current state of the invoice (not paid)
   * @private
   */
  private async adjustRevenueForStatusChange(
    previousInvoice: InvoiceDto | undefined,
    currentInvoice: InvoiceDto,
  ): Promise<void> {
    if (!previousInvoice) return;

    try {
      const period = extractPeriodFromInvoice(previousInvoice);
      if (!period) {
        logger.warn({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoiceId: currentInvoice.id,
          message: "Could not extract valid period from previous invoice date",
        });
        return;
      }

      // Get the existing revenue record for this period
      const existingRevenue =
        await this.revenueService.getRevenueByPeriod(period);

      if (!existingRevenue) {
        logger.warn({
          context: "RevenueEventHandler.adjustRevenueForStatusChange",
          invoiceId: currentInvoice.id,
          message:
            "No revenue record found for the period of the updated invoice",
          period,
        });
        return;
      }

      // Calculate new values after removing the invoice
      const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
      const newRevenue = Math.max(
        0,
        existingRevenue.revenue - previousInvoice.amount,
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
        context: "RevenueEventHandler.adjustRevenueForStatusChange",
        invoiceId: currentInvoice.id,
        message: "Revenue record updated after invoice status change",
        newInvoiceCount,
        newRevenue,
        period,
      });
    } catch (error) {
      handleEventError(
        "RevenueEventHandler.adjustRevenueForStatusChange",
        error,
        {
          invoiceId: currentInvoice.id,
        },
      );
    }
  }

  /**
   * Handles invoice deletion events by updating the corresponding revenue record.
   * When a paid invoice is deleted, we need to decrement the invoice count and subtract
   * the invoice amount from the revenue total for the affected period.
   *
   * @param event - The invoice deletion event containing the deleted invoice data
   */
  private async handleInvoiceDeleted(event: BaseInvoiceEvent): Promise<void> {
    try {
      // Validate the invoice and check if it's eligible for revenue adjustment
      if (
        !this.isInvoiceEligibleForRevenue(event.invoice, "handleInvoiceDeleted")
      ) {
        return;
      }

      const period = extractPeriodFromInvoice(event.invoice);

      if (!period) {
        logger.warn({
          context: "RevenueEventHandler.handleInvoiceDeleted",
          invoiceId: event.invoice.id,
          message: "Could not extract valid period from invoice date",
        });
        return;
      }

      // Log the deletion event
      logger.info({
        amount: event.invoice.amount,
        context: "RevenueEventHandler.handleInvoiceDeleted",
        invoiceId: event.invoice.id,
        period,
        status: event.invoice.status,
      });

      // Adjust revenue for the deleted invoice
      await this.adjustRevenueForDeletedInvoice(event.invoice, period);
    } catch (error) {
      handleEventError("RevenueEventHandler.handleInvoiceDeleted", error, {
        invoiceId: event.invoice?.id,
      });
    }
  }

  /**
   * Adjusts revenue when a paid invoice is deleted.
   * This decrements the invoice count and subtracts the invoice amount from the revenue.
   *
   * @param invoice - The deleted invoice
   * @param period - The period (YYYY-MM) associated with the invoice
   * @private
   */
  private async adjustRevenueForDeletedInvoice(
    invoice: InvoiceDto,
    period: string,
  ): Promise<void> {
    try {
      // Get the existing revenue record for this period
      const existingRevenue =
        await this.revenueService.getRevenueByPeriod(period);

      if (!existingRevenue) {
        logger.warn({
          context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
          invoiceId: invoice.id,
          message:
            "No revenue record found for the period of the deleted invoice",
          period,
        });
        return;
      }

      // Calculate new values after removing the deleted invoice
      const newInvoiceCount = Math.max(0, existingRevenue.invoiceCount - 1);
      const newRevenue = Math.max(0, existingRevenue.revenue - invoice.amount);

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
        context: "RevenueEventHandler.adjustRevenueForDeletedInvoice",
        invoiceId: invoice.id,
        message: "Revenue record updated after invoice deletion",
        newInvoiceCount,
        newRevenue,
        period,
      });
    } catch (error) {
      handleEventError(
        "RevenueEventHandler.adjustRevenueForDeletedInvoice",
        error,
        {
          invoiceId: invoice.id,
        },
      );
    }
  }
}
