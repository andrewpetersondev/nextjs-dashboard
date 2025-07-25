"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import type { Database } from "@/db/connection";
import type {
  RevenueDto,
  SimpleRevenueDto,
} from "@/features/revenues/revenue.dto";
import {
  entityToDto,
  entityToSimpleDto,
} from "@/features/revenues/revenue.mapper";
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

export async function getRevenueAction(
  db: Database,
  input: RevenueQueryInput,
): Promise<RevenueActionResult<RevenueDto[]>> {
  try {
    const { year } = validateRevenueInput(input);

    const revenueService = new RevenueService(db);
    const revenueEntities = await revenueService.getRevenueForYear(year);

    const revenueDto = revenueEntities.map((entity) => entityToDto(entity));

    return { data: revenueDto, success: true };
  } catch (error) {
    console.error("Revenue action error:", error);

    if (error instanceof z.ZodError) {
      return { error: "Invalid input parameters", success: false };
    }

    return { error: "Failed to fetch revenue data", success: false };
  }
}

export async function recalculateRevenueAction(
  db: Database,
  input: RevenueRecalculationInput,
): Promise<RevenueActionResult<RevenueDto[]>> {
  try {
    const { year } = RecalculateRevenueSchema.parse(input);

    const revenueService = new RevenueService(db);
    const revenueEntities =
      await revenueService.recalculateRevenueForYear(year);

    const revenueDto = revenueEntities.map((entity) => entityToDto(entity));

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
 * Returns simplified revenue data with only month and revenue amount
 */
export async function getRevenueChartDataAction(
  db: Database,
  input: RevenueQueryInput = {},
): Promise<RevenueActionResult<SimpleRevenueDto[]>> {
  try {
    const { year } = validateRevenueInput(input);

    const revenueService = new RevenueService(db);
    const revenueEntities = await revenueService.getRevenueForYear(year);

    const chartData = revenueEntities.map((entity) =>
      entityToSimpleDto(entity),
    );

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
