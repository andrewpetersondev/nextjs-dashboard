import "server-only";

import type { DB } from "@/src/lib/db/connection.ts";
import { revenues } from "@/src/lib/db/schema.ts";
import type { Revenue } from "@/src/lib/definitions/revenue.ts";

export async function fetchRevenue(db: DB): Promise<Revenue[]> {
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

	try {
		const data: Revenue[] = await db.select().from(revenues);

		return data.sort(
			(a: Revenue, b: Revenue): number =>
				monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
		);
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch revenue data.");
	}
}
