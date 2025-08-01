import "server-only";

import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/db/models/revenue.entity";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import type { RevenueRepository } from "@/features/revenues/revenue.repository";
import type { InvoiceId } from "@/lib/definitions/brands";

/**
 * Business service for revenue processing and management.
 * Handles the coordination between invoice and revenue data.
 */
export class RevenueService {
  constructor(
    private readonly revenueRepository: RevenueRepository,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}

  /**
   * Processes revenue recognition from a paid invoice.
   * Creates or updates revenue records based on invoice data.
   *
   * @param invoiceId - Unique identifier of the invoice to process
   * @returns Promise resolving to the created/updated revenue entity
   * @throws {Error} When invoice is not found or not in paid status
   */
  async processInvoiceRevenue(invoiceId: InvoiceId): Promise<RevenueEntity> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status !== "paid") {
      throw new Error(
        `Cannot recognize revenue for unpaid invoice ${invoiceId}`,
      );
    }

    const revenueData = this.calculateRevenueFromInvoice(invoice);
    return this.revenueRepository.upsert(revenueData);
  }

  /**
   * Retrieves revenue records within a specific date range.
   *
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to array of revenue entities
   */
  async getRevenueByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueEntity[]> {
    return this.revenueRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Removes revenue recognition for a specific invoice.
   * Used when invoices are voided or payment is reversed.
   *
   * @param invoiceId - Unique identifier of the invoice
   * @returns Promise that resolves when revenue is removed
   */
  async reverseInvoiceRevenue(invoiceId: InvoiceId): Promise<void> {
    // Note: This implementation assumes you'll add a way to find revenue by invoice
    // For now, this is a placeholder that shows the intended interface
    throw new Error(
      "Revenue reversal not yet implemented - requires invoice tracking in revenue",
    );
  }

  /**
   * Synchronizes all paid invoices with revenue recognition.
   * Useful for initial data migration or fixing inconsistencies.
   *
   * @returns Promise that resolves when synchronization is complete
   */
  async syncInvoicesWithRevenue(): Promise<void> {
    const invoices = await this.invoiceRepository.findAll();

    for (const invoice of invoices) {
      if (invoice.status === "paid") {
        await this.processInvoiceRevenue(invoice.id);
      }
    }
  }

  /**
   * Calculates revenue statistics for a given date range.
   *
   * @param startDate - Start of the analysis period
   * @param endDate - End of the analysis period
   * @returns Promise resolving to statistical summary
   */
  async getRevenueStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    average: number;
    count: number;
    total: number;
  }> {
    const revenues = await this.getRevenueByDateRange(startDate, endDate);
    const total = revenues.reduce((sum, revenue) => sum + revenue.revenue, 0);
    const count = revenues.length;
    const average = count > 0 ? Math.round(total / count) : 0;

    return { average, count, total };
  }

  /**
   * Transforms invoice data into revenue entity structure.
   * Applies business rules for revenue recognition timing and amounts.
   *
   * @param invoice - Invoice entity to process
   * @returns Revenue creation data without timestamps
   * @private
   */
  private calculateRevenueFromInvoice(
    invoice: InvoiceEntity,
  ): RevenueCreateEntity {
    const recognitionDate = this.determineRevenueRecognitionDate(invoice);
    const month = recognitionDate.toISOString().slice(0, 7); // YYYY-MM format
    const year = recognitionDate.getFullYear();

    // Calculate month boundaries
    const startDate = `${year}-${String(recognitionDate.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, recognitionDate.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${String(recognitionDate.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    return {
      calculatedFromInvoices: invoice.amount,
      calculationDate: new Date(),
      calculationSource: "invoice_recognition",
      endDate,
      // id: toRevenueId(crypto.randomUUID()),
      invoiceCount: 1,
      isCalculated: true,
      month,
      revenue: invoice.amount,
      startDate,
      year,
    };
  }

  /**
   * Determines when revenue should be recognized based on invoice data.
   * Currently uses invoice date as recognition date.
   *
   * @param invoice - Invoice entity to analyze
   * @returns Date when revenue should be recognized
   * @private
   */
  private determineRevenueRecognitionDate(invoice: InvoiceEntity): Date {
    // Use invoice date as the recognition date
    // In more complex scenarios, this could consider service delivery dates,
    // subscription periods, or other business rules
    return new Date(invoice.date);
  }
}
