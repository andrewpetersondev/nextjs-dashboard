import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueRawDrizzle } from "@/db/schema";
import type { RevenueDto } from "@/features/revenues/revenue.dto";

export function toRevenueEntity(row: RevenueRawDrizzle): RevenueEntity {
  return {
    month: row.month,
    revenue: row.revenue,
    sensitiveData: row.sensitiveData, // Sensitive data should not be exposed in DTOs
  };
}

export function toRevenueDto(revenue: RevenueEntity): RevenueDto {
  return {
    month: revenue.month,
    revenue: revenue.revenue,
  };
}
