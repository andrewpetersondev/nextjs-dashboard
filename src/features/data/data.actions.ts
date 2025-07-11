"use server";

import { getDB } from "@/db/connection";
import { fetchDashboardCardData } from "@/features/data/data.dal";
import type { DashboardCardData } from "@/features/data/data.types";

// TODO: THIS FILE SHOULD BE TEMPORARY AND REPLACED WITH A BETTER SOLUTION

/**
 * Server action to fetch dashboard card data.
 * @returns CardData object for dashboard cards.
 */
export async function readCardDataAction(): Promise<DashboardCardData> {
  const db = getDB();
  return fetchDashboardCardData(db);
}
