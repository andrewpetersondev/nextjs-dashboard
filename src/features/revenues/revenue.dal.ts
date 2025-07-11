import "server-only";

import type { Db } from "@/db/connection";
import { revenues } from "@/db/schema";
import type { Revenue } from "@/features/revenues/revenue.types";

export async function fetchRevenue(db: Db): Promise<Revenue[]> {
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
