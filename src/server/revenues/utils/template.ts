import "server-only";

// biome-ignore lint/correctness/noNodejsModules: <this file is server-only>
import { randomUUID } from "node:crypto";
import { serverLogger } from "@/server/logging/serverLogger";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/entity";
import { mapRevenueEntityToDisplayEntity } from "@/server/revenues/mappers";
import type { Period } from "@/shared/brands/domain-brands";
import { toPeriod, toRevenueId } from "@/shared/brands/mappers";

/**
 * Internal helper: construct a default RevenueEntity for a given period.
 * DRY: used by default month and default period creators.
 */
function makeDefaultRevenueEntity(p: Period): RevenueEntity {
  return {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(randomUUID()),
    invoiceCount: 0,
    period: toPeriod(p),
    totalAmount: 0,
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

  serverLogger.debug({
    context: "createDefaultRevenueData",
    message: "Created default revenue data",
    period,
  });

  return mappedData;
}
