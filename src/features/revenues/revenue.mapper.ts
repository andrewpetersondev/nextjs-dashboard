import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueRow } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import type {
  RevenueDto,
  SimpleRevenueDto,
} from "@/features/revenues/revenue.dto";
import { toRevenueId } from "@/lib/definitions/brands";

/**
 * Convert database row to entity (validates and adds branded types)
 */
export function rowToEntity(row: RevenueRow): RevenueEntity {
  return {
    calculatedFromInvoices: row.calculatedFromInvoices,
    calculationDate: row.calculationDate,
    calculationSource: row.calculationSource,
    createdAt: row.createdAt,
    endDate: row.endDate,
    id: toRevenueId(row.id),
    invoiceCount: row.invoiceCount,
    isCalculated: row.isCalculated,
    month: row.month,
    revenue: row.revenue,
    startDate: row.startDate,
    updatedAt: row.updatedAt,
    year: row.year,
  };
}

/**
 * Convert entity to DTO for client exposure
 */
export function entityToDto(entity: RevenueEntity): RevenueDto {
  return {
    calculationDate: entity.calculationDate?.toISOString(),
    calculationSource: entity.calculationSource,
    invoiceCount: entity.invoiceCount,
    isCalculated: entity.isCalculated,
    month: entity.month,
    revenue: entity.revenue,
    year: entity.year,
  };
}

/**
 * Convert entity to simple DTO for charts
 */
export function entityToSimpleDto(entity: RevenueEntity): SimpleRevenueDto {
  return {
    month: entity.month,
    revenue: entity.revenue,
  };
}

/**
 * Convert raw invoice data to revenue entity
 */
export function invoiceDataToRevenue(
  month: string,
  totalAmount: number,
  invoiceCount: number,
  year: number,
): Omit<RevenueEntity, "id"> {
  const now = new Date();
  const monthIndex = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(month);

  // Validate month exists
  if (monthIndex === -1) {
    throw new ValidationError(
      `Invalid month: "${month}". Must be a valid 3-letter month abbreviation.`,
    );
  }

  // Validate year is reasonable
  if (year < 1900 || year > 2100) {
    throw new ValidationError(
      `Invalid year: ${year}. Must be between 1900 and 2100.`,
    );
  }

  // Create dates with validation
  const startDateObj = new Date(year, monthIndex, 1);
  const endDateObj = new Date(year, monthIndex + 1, 0);

  // Validate dates are valid
  if (
    Number.isNaN(startDateObj.getTime()) ||
    Number.isNaN(endDateObj.getTime())
  ) {
    throw new ValidationError(
      `Failed to create valid dates for ${month} ${year}`,
    );
  }

  // todo: remove String() wrapper by finding a better way to make sure the dates are strings
  const startDate = String(startDateObj.toISOString().split("T")[0]);
  const endDate = String(endDateObj.toISOString().split("T")[0]);

  return {
    calculatedFromInvoices: totalAmount,
    calculationDate: now,
    calculationSource: "invoice_calculation",
    createdAt: now,
    endDate,
    invoiceCount,
    isCalculated: true,
    month,
    revenue: totalAmount,
    startDate,
    updatedAt: now,
    year,
  };
}

/**
 * Convert DTO to simple DTO for charts
 */
export function dtoToSimpleDto(dto: RevenueDto): SimpleRevenueDto {
  return {
    month: dto.month,
    revenue: dto.revenue,
  };
}
