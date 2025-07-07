// TODO: THIS FILE SHOULD BE TEMPORARY AND REPLACED WITH A BETTER SOLUTION

import { fetchCardData } from "@/src/lib/dal/data.dal";
import { getDB } from "@/src/lib/db/connection";
import type { CardData } from "@/src/lib/definitions/data.types";

/**
 * Server action to fetch dashboard card data.
 * @returns CardData object for dashboard cards.
 */
export async function readCardDataAction(): Promise<CardData> {
	const db = getDB();
	return fetchCardData(db);
}
