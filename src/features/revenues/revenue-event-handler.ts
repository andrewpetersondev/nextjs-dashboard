import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { EventBus } from "@/lib/events/eventBus";
import type { BaseInvoiceEvent } from "@/lib/events/invoice.events";
import { logger } from "@/lib/utils/logger";
import type { RevenueService } from "./revenue.service";

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
  }

  private async handleInvoiceCreated(event: BaseInvoiceEvent): Promise<void> {
    if (!event || !event.invoice) {
      logger.warn({
        context: "RevenueEventHandler.handleInvoiceCreated",
        invoiceId: event.invoice?.id,
        message: "Invalid invoice parameters.",
      });
      return; // Skip if event or invoice is invalid
    }

    if (event.invoice.status !== "paid") {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceCreated",
        invoiceId: event.invoice.id,
        message: "Invoice status is not 'paid', skipping revenue calculation",
      });
      return; // Skip if the invoice is not paid
    }

    // Log the creation event
    logger.info({
      amount: event.invoice.amount,
      context: "RevenueEventHandler.handleInvoiceCreated",
      invoiceId: event.invoice.id,
      status: event.invoice.status,
    });

    // i need to check if a revenue record already exists for the month of the invoice
    // should the service be able to return null if no record exists?
    const existingRevenue = await this.revenueService.getRevenueByPeriod(
      event.invoice.date.substring(0, 7), // Extract YYYY-MM from date
    );

    // check for an existing revenue
    if (!existingRevenue) {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceCreated",
        invoiceId: event.invoice.id,
        message:
          "No existing revenue record found, creating new revenue record",
      });
      // do something
    }

    // if invoiceCount and revenue are  0, we need to create a new revenue record
    if (existingRevenue.invoiceCount === 0 && existingRevenue.revenue === 0) {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceCreated",
        invoiceId: event.invoice.id,
        message:
          "No existing revenue record found, creating new revenue record",
      });
      // Create new revenue record
      // create revenue object to be used in the service
      const revenue = {
        calculationSource: "handler",
        createdAt: new Date(),
        invoiceCount: 1,
        period: event.invoice.date.substring(0, 7), // Extract YYYY-MM from date
        revenue: event.invoice.amount,
        updatedAt: new Date(),
      };
      await this.revenueService.createRevenue(revenue);
    }

    // if invoice count or revenue are greater than 0, we need to update the existing revenue record
    if (existingRevenue.invoiceCount > 0 || existingRevenue.revenue > 0) {
      logger.info({
        context: "RevenueEventHandler.handleInvoiceCreated",
        invoiceId: event.invoice.id,
        message:
          "Existing revenue record found, updating existing revenue record",
      });
      // Update existing revenue record
      // create revenue object to be used in the service
      const revenue = {
        calculationSource: "handler",
        createdAt: existingRevenue.createdAt,
        invoiceCount: existingRevenue.invoiceCount + 1,
        period: existingRevenue.period, // Keep the same period
        revenue: existingRevenue.revenue + event.invoice.amount,
        updatedAt: new Date(),
      };
      await this.revenueService.updateRevenue(existingRevenue.id, revenue);
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
    try {
      // Extract YYYY-MM from invoice date
      const invoiceDate = new Date(invoice.date);
      const monthKey = invoiceDate.toISOString().substring(0, 7); // "YYYY-MM"

      // Create or update monthly revenue record
      await this.revenueService.upsertMonthlyRevenue(monthKey, invoice);

      logger.info({
        amount: invoice.amount,
        context: "RevenueEventHandler.recalculateRevenue",
        invoiceId: invoice.id,
        monthKey,
        status: invoice.status,
      });
    } catch (error) {
      // Don't throw - avoid blocking the event bus
      logger.error({
        context: "RevenueEventHandler.recalculateRevenue",
        error,
        invoiceId: invoice.id,
      });
    }
  }
}
