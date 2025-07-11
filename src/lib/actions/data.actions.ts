"use server";

import { fetchDashboardCardData } from "@/lib/dal/data.dal";
import { getDB } from "@/lib/db/connection";
import type { DashboardCardData } from "@/lib/definitions/data.types";

// TODO: THIS FILE SHOULD BE TEMPORARY AND REPLACED WITH A BETTER SOLUTION

/**
 * Server action to fetch dashboard card data.
 * @returns CardData object for dashboard cards.
 */
export async function readCardDataAction(): Promise<DashboardCardData> {
  const db = getDB();
  return fetchDashboardCardData(db);
}
