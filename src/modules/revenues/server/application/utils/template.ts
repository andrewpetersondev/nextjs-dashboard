import "server-only";
import { mapRevenueEntityToDisplayEntity } from "@/modules/revenues/server/application/mappers/revenue-display.mapper";
import type { RevenueEntity } from "@/modules/revenues/server/domain/entities/entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/server/domain/entities/entity.client";
import type { Period } from "@/shared/branding/brands";
import {
  toPeriod,
  toRevenueId,
} from "@/shared/branding/converters/id-converters";

/**
 * Internal helper: construct a default RevenueEntity for a given period.
 * DRY: used by default month and default period creators.
 */
function makeDefaultRevenueEntity(p: Period): RevenueEntity {
  return {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(crypto.randomUUID()),
    invoiceCount: 0,
    period: toPeriod(p),
    totalAmount: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    updatedAt: new Date(),
  };
}

/**
 * Creates a default revenue display entity for a specific period.
 * This function creates a RevenueDisplayEntity object by first creating a default
 * RevenueEntity and then transforming it using the factory method.
 * Use createDefaultRevenueEntity if you need a database-compatible entity.
 *
 * @param period - Branded Period (first-of-month Date)
 * @returns Complete RevenueDisplayEntity with default values
 */
export function createDefaultRevenueData(period: Period): RevenueDisplayEntity {
  // Create a default RevenueEntity
  const defaultEntity: RevenueEntity = makeDefaultRevenueEntity(period);

  // Transform to RevenueDisplayEntity using the factory method
  const mappedData = mapRevenueEntityToDisplayEntity(defaultEntity);

  //  logger.info("createDefaultRevenueData", mappedData);

  return mappedData;
}
