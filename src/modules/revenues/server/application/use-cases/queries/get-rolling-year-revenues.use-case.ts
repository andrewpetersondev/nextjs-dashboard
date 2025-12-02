import "server-only";
import { mapRevenueEntityToDisplayEntity } from "@/modules/revenues/server/application/mappers/revenue-display.mapper";
import { mergeWithTemplate } from "@/modules/revenues/server/application/services/revenue/helpers/merge";
import {
  buildDefaultsFromFreshTemplate,
  buildTemplateAndPeriods,
} from "@/modules/revenues/server/application/services/revenue/helpers/templates";
import type { RevenueEntity } from "@/modules/revenues/server/domain/entities/entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/server/domain/entities/entity.client";
import type { RevenueRepositoryInterface } from "@/modules/revenues/server/infrastructure/repository/interface";
import type { Period } from "@/shared/branding/brands";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export class GetRollingYearRevenuesUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(): Promise<RevenueDisplayEntity[]> {
    try {
      //      logger.info("buildTemplateAndPeriods execute");

      const { template, startPeriod, endPeriod } = buildTemplateAndPeriods();

      const displayEntities = await this.fetchDisplayEntities(
        startPeriod,
        endPeriod,
      );

      const result = mergeWithTemplate(template, displayEntities);

      //      logger.info("buildTemplateAndPeriods execute", result);

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
