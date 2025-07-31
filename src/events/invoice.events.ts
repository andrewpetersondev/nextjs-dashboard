import "server-only";

import type { Database } from "@/db/connection";
import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type { RevenueService } from "@/features/revenues/revenue.service";
import { RevenueCalculatorService } from "@/features/revenues/revenue-calculator.service";
import type { InvoiceId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

/**
 * Base interface for all invoice-related events.
 * Provides common structure and metadata for event processing.
 */
interface BaseInvoiceEvent {
  /** Unique identifier for the event instance */
  readonly eventId: string;
  /** Timestamp when the event occurred */
  readonly timestamp: Date;
  /** Type of invoice event for discrimination */
  readonly type: string;
  /** Invoice ID that triggered the event */
  readonly invoiceId: InvoiceId;
  /** Optional correlation ID for tracking related events */
  readonly correlationId?: string;
}

/**
 * Event emitted when an invoice is created.
 */
export interface InvoiceCreatedEvent extends BaseInvoiceEvent {
  readonly type: "invoice.created";
  /** Complete invoice entity data */
  readonly invoice: InvoiceEntity;
}

/**
 * Event emitted when an invoice is updated.
 */
export interface InvoiceUpdatedEvent extends BaseInvoiceEvent {
  readonly type: "invoice.updated";
  /** Updated invoice entity data */
  readonly invoice: InvoiceEntity;
  /** Previous invoice state for comparison */
  readonly previousInvoice: InvoiceEntity;
}

/**
 * Event emitted when an invoice is paid.
 * This triggers revenue recognition processing.
 */
export interface InvoicePaidEvent extends BaseInvoiceEvent {
  readonly type: "invoice.paid";
  /** Paid invoice entity data */
  readonly invoice: InvoiceEntity;
  /** Payment timestamp */
  readonly paidAt: Date;
}

/**
 * Event emitted when an invoice is voided.
 * This may trigger revenue reversal processing.
 */
export interface InvoiceVoidedEvent extends BaseInvoiceEvent {
  readonly type: "invoice.voided";
  /** Voided invoice entity data */
  readonly invoice: InvoiceEntity;
  /** Reason for voiding */
  readonly reason?: string;
}

/**
 * Event emitted when an invoice is deleted.
 */
export interface InvoiceDeletedEvent extends BaseInvoiceEvent {
  readonly type: "invoice.deleted";
  /** ID of the deleted invoice */
  readonly invoiceId: InvoiceId;
}

/**
 * Union type of all possible invoice events.
 */
export type InvoiceEvent =
  | InvoiceCreatedEvent
  | InvoiceUpdatedEvent
  | InvoicePaidEvent
  | InvoiceVoidedEvent
  | InvoiceDeletedEvent;

/**
 * Event handler for processing invoice-related events and updating revenue.
 * Implements dependency injection pattern for testability and flexibility.
 */
export class InvoiceEventHandler {
  constructor(
    private readonly revenueService: RevenueService,
    private readonly revenueCalculator: RevenueCalculatorService,
    private readonly db: Database,
  ) {}

  /**
   * Processes incoming invoice events and dispatches to appropriate handlers.
   *
   * @param event - Invoice event to process
   * @returns Promise that resolves when event processing is complete
   * @throws {Error} When event processing fails
   */
  async handleInvoiceEvent(event: InvoiceEvent): Promise<void> {
    try {
      logger.info({
        eventId: event.eventId,
        eventType: event.type,
        invoiceId: event.invoiceId,
        message: "Processing invoice event",
      });

      switch (event.type) {
        case "invoice.created":
          await this.handleInvoiceCreated(event);
          break;
        case "invoice.updated":
          await this.handleInvoiceUpdated(event);
          break;
        case "invoice.paid":
          await this.handleInvoicePaid(event);
          break;
        case "invoice.voided":
          await this.handleInvoiceVoided(event);
          break;
        case "invoice.deleted":
          await this.handleInvoiceDeleted(event);
          break;
        default:
          logger.warn({
            eventType: (event as any).type,
            message: "Unknown invoice event type",
          });
      }

      logger.info({
        eventId: event.eventId,
        eventType: event.type,
        message: "Invoice event processed successfully",
      });
    } catch (error) {
      logger.error({
        error,
        eventId: event.eventId,
        eventType: event.type,
        invoiceId: event.invoiceId,
        message: "Failed to process invoice event",
      });
      throw error;
    }
  }

  /**
   * Handles invoice creation events.
   * Currently no revenue impact until invoice is paid.
   */
  private async handleInvoiceCreated(
    event: InvoiceCreatedEvent,
  ): Promise<void> {
    // Invoice creation doesn't immediately affect revenue
    // Revenue is recognized when invoice is paid
    logger.debug({
      invoiceId: event.invoiceId,
      message: "Invoice created - no revenue impact",
    });
  }

  /**
   * Handles invoice update events.
   * Processes revenue impact if payment status changed.
   */
  private async handleInvoiceUpdated(
    event: InvoiceUpdatedEvent,
  ): Promise<void> {
    const statusChanged = event.previousInvoice.status !== event.invoice.status;

    if (statusChanged && event.invoice.status === "paid") {
      // Invoice was paid in this update
      await this.processRevenueRecognition(event.invoice);
    } else if (statusChanged && event.previousInvoice.status === "paid") {
      // Invoice was unpaid (status changed from paid to pending)
      await this.processRevenueReversal(event.invoiceId);
    }
  }

  /**
   * Handles invoice paid events.
   * Triggers revenue recognition processing.
   */
  private async handleInvoicePaid(event: InvoicePaidEvent): Promise<void> {
    await this.processRevenueRecognition(event.invoice);
  }

  /**
   * Handles invoice voided events.
   * Reverses any recognized revenue.
   */
  private async handleInvoiceVoided(event: InvoiceVoidedEvent): Promise<void> {
    await this.processRevenueReversal(event.invoiceId);
  }

  /**
   * Handles invoice deletion events.
   * Removes any associated revenue recognition.
   */
  private async handleInvoiceDeleted(
    event: InvoiceDeletedEvent,
  ): Promise<void> {
    await this.processRevenueReversal(event.invoiceId);
  }

  /**
   * Processes revenue recognition for a paid invoice.
   * Updates monthly revenue calculations.
   */
  private async processRevenueRecognition(
    invoice: InvoiceEntity,
  ): Promise<void> {
    try {
      // Recognize revenue for the specific invoice
      await this.revenueService.processInvoiceRevenue(invoice.id);

      // Recalculate rolling 12-month revenue data to ensure consistency
      await this.revenueCalculator.calculateForYear();

      logger.info({
        invoiceId: invoice.id,
        amount: invoice.amount,
        message: "Revenue recognized for paid invoice",
      });
    } catch (error) {
      logger.error({
        error,
        invoiceId: invoice.id,
        message: "Failed to process revenue recognition",
      });
      throw error;
    }
  }

  /**
   * Processes revenue reversal for voided or deleted invoices.
   * Updates monthly revenue calculations.
   */
  private async processRevenueReversal(invoiceId: InvoiceId): Promise<void> {
    try {
      // Reverse revenue recognition
      await this.revenueService.reverseInvoiceRevenue(invoiceId);

      // Recalculate rolling 12-month revenue data
      await this.revenueCalculator.calculateForYear();

      logger.info({
        invoiceId,
        message: "Revenue reversed for voided/deleted invoice",
      });
    } catch (error) {
      logger.error({
        error,
        invoiceId,
        message: "Failed to process revenue reversal",
      });
      throw error;
    }
  }
}

/**
 * Factory function to create an invoice event handler with proper dependencies.
 * Implements dependency injection pattern for better testability.
 *
 * @param db - Database connection
 * @param revenueService - Revenue service instance
 * @returns Configured invoice event handler
 */
export function createInvoiceEventHandler(
  db: Database,
  revenueService: RevenueService,
): InvoiceEventHandler {
  const revenueCalculator = new RevenueCalculatorService(db);
  return new InvoiceEventHandler(revenueService, revenueCalculator, db);
}
