import "server-only";

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

const monthOrder: string[] = [
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
];

export async function fetchRevenue(
  db: Database,
  year?: number,
): Promise<RevenueDto[]> {
  const revenueService = new RevenueService(db);
  const targetYear = year || new Date().getFullYear();

  try {
    const revenueEntities = await revenueService.getRevenueForYear(targetYear);

    const sortedRevenue = revenueEntities.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );

    return sortedRevenue.map(entityToDto);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error(`Failed to fetch revenue data for year ${targetYear}.`);
  }
}

export async function fetchSimpleRevenue(
  db: Database,
  year?: number,
): Promise<SimpleRevenueDto[]> {
  const revenueService = new RevenueService(db);
  const targetYear = year || new Date().getFullYear();

  try {
    const revenueEntities = await revenueService.getRevenueForYear(targetYear);

    const sortedRevenue = revenueEntities.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );

    return sortedRevenue.map(entityToSimpleDto);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch simple revenue data.");
  }
}

export async function recalculateRevenue(
  db: Database,
  year?: number,
): Promise<RevenueDto[]> {
  const revenueService = new RevenueService(db);
  const targetYear = year || new Date().getFullYear();

  try {
    const revenueEntities =
      await revenueService.recalculateRevenueForYear(targetYear);

    const sortedRevenue = revenueEntities.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );

    return sortedRevenue.map(entityToDto);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error(
      `Failed to recalculate revenue data for year ${targetYear}.`,
    );
  }
}
