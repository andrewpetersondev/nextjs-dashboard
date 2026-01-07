import "server-only";

import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import {
  buildDefaultsFromFreshTemplate,
  buildTemplateAndPeriods,
  mergeWithTemplate,
} from "@/modules/revenues/domain/templates/manager";
import { mapRevenueEntityToDisplayEntity } from "@/modules/revenues/infrastructure/mappers/revenue-display.mapper";
import type { Period } from "@/shared/branding/brands";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export class GetRollingYearRevenuesUseCase {
  private readonly repository: RevenueRepositoryContract;

  constructor(repository: RevenueRepositoryContract) {
    this.repository = repository;
  }

  async execute(): Promise<RevenueDisplayEntity[]> {
    try {
      const { endPeriod, startPeriod, template } = buildTemplateAndPeriods();

      const displayEntities = await this.fetchDisplayEntities(
        startPeriod,
        endPeriod,
      );

      const result = mergeWithTemplate(template, displayEntities);

      return result;
    } catch (error) {
      logger.error("rolling year revenue failed", error);
      try {
        return buildDefaultsFromFreshTemplate();
      } catch (fallbackError) {
        logger.error("buildTemplateAndPeriods failed", fallbackError);
        return [];
      }
    }
  }

  private async fetchDisplayEntities(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueDisplayEntity[]> {
    const revenueEntities: RevenueEntity[] =
      await this.repository.findByDateRange(startPeriod, endPeriod);

    const displayEntities = revenueEntities.map(
      (entity: RevenueEntity): RevenueDisplayEntity =>
        mapRevenueEntityToDisplayEntity(entity),
    );

    return displayEntities;
  }
}
