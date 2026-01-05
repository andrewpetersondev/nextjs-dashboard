import "server-only";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import { createRevenueDisplayEntity } from "@/modules/revenues/domain/factories/revenue-display.factory";

/**
 * Maps RevenueEntity to RevenueDisplayEntity with computed display fields.
 * Delegates to the domain factory.
 */
export function mapRevenueEntityToDisplayEntity(
  revenueEntity: RevenueEntity,
): RevenueDisplayEntity {
  return createRevenueDisplayEntity(revenueEntity);
}
