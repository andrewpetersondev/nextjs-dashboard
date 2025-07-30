"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { type Database, getDB } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { ValidationError } from "@/errors/errors";
import type {
  RevenueDto,
  SimpleRevenueDto,
} from "@/features/revenues/revenue.dto";
import {
  entityToRevenueDto,
  entityToSimpleDto,
} from "@/features/revenues/revenue.mapper";
import { RevenueRepository } from "@/features/revenues/revenue.repository";
import { RevenueService } from "@/features/revenues/revenue.service";
import {
  RecalculateRevenueSchema,
  type RevenueActionResult,
  type RevenueQueryInput,
  type RevenueRecalculationInput,
} from "@/features/revenues/revenue.types";
import {
  sortRevenueByMonth,
  validateRevenueInput,
} from "@/features/revenues/revenue.utils";
import { REVENUE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toRevenueId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

/**
 * Server action to create a new revenue entry.
 * @remarks Unclear if this is needed, as revenue is usually calculated from invoices and independent from user input.
 */
export async function createRevenueAction() {}

/**
 * Server action to read revenue by ID
 * @param id - The revenue ID (string)
 * @returns Promise resolving to RevenueDto
 * @throws ValidationError for invalid input
 * @throws Error if fetching fails
 */
export async function readRevenueAction(id: string): Promise<RevenueDto> {
  try {
    // Basic validation of parameters
    if (!id) {
      throw new ValidationError(REVENUE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Dependency injection: pass repository to service
    const repo = new RevenueRepository(getDB());

    // Create service instance with injected repository
    const service = new RevenueService(repo);

    // Call service with validated DTO to retrieve complete RevenueDto
    const revenue: RevenueDto = await service.readRevenue(toRevenueId(id));

    return revenue;
  } catch (error) {
    // How should I handle errors here? They bubble up from DAL -> REPO -> SERVICE -> ACTION
    logger.error({
      error,
      id,
      message: "Read revenue action error",
    });
    if (error instanceof ValidationError) {
      throw new ValidationError(REVENUE_ERROR_MESSAGES.INVALID_ID, {
        error,
        id,
      });
    }
    throw new Error(REVENUE_ERROR_MESSAGES.FETCH_FAILED, { cause: error });
  }
}
// export async function updateRevenueAction(){}
// export async function deleteRevenueAction(){}

export async function getRevenueAction(
  input: RevenueQueryInput,
): Promise<RevenueActionResult<RevenueDto[]>> {
  try {
    const { year } = validateRevenueInput(input);

    const repo = new RevenueRepository(getDB());
    const service = new RevenueService(repo);
    const revenue = await service.getRevenueForYear(year);

    const revenueResult = revenue.map((entity) => entityToRevenueDto(entity));

    return { data: revenueResult, success: true };
  } catch (error) {
    console.error("Revenue action error:", error);

    if (error instanceof z.ZodError) {
      return { error: "Invalid input parameters", success: false };
    }

    return { error: "Failed to fetch revenue data", success: false };
  }
}

export async function recalculateRevenueAction(
  input: RevenueRecalculationInput,
): Promise<RevenueActionResult<RevenueDto[]>> {
  try {
    const { year } = RecalculateRevenueSchema.parse(input);

    const repo = new RevenueRepository(getDB());
    const service = new RevenueService(repo);

    const revenueEntities = await service.recalculateRevenueForYear(year);

    const revenueDto = revenueEntities.map((entity) =>
      entityToRevenueDto(entity),
    );

    revalidatePath("/dashboard");
    revalidatePath(`/revenue/${year}`);

    return { data: revenueDto, success: true };
  } catch (error) {
    console.error("Recalculate revenue action error:", error);

    if (error instanceof z.ZodError) {
      return { error: "Invalid year parameter", success: false };
    }

    return { error: "Failed to recalculate revenue", success: false };
  }
}

/**
 * Fetch revenue data optimized for chart display
 * Returns simplified revenue data with only a month and revenue amount
 */
export async function getRevenueChartAction(
  input: RevenueQueryInput = {},
): Promise<RevenueActionResult<SimpleRevenueDto[]>> {
  try {
    // Validate input parameters. If input is empty, default to current year.
    const { year } = validateRevenueInput(input);

    // Dependency injection: pass repository to service
    const repo = new RevenueRepository(getDB());

    // Create service instance with injected repository
    const service = new RevenueService(repo);

    // Call service to get revenue data for the specified year
    const revenue: RevenueEntity[] = await service.getRevenueForYear(year);

    const chartData = revenue.map((entity) => entityToSimpleDto(entity));

    const sortedData = sortRevenueByMonth(chartData);

    return { data: sortedData, success: true };
  } catch (error) {
    console.error("Revenue chart data action error:", error);

    if (error instanceof z.ZodError) {
      return { error: "Invalid input parameters", success: false };
    }

    return { error: "Failed to fetch revenue chart data", success: false };
  }
}
