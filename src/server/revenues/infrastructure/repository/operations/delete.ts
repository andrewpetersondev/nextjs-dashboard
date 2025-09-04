import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { RevenueId } from "@/shared/brands/domain-brands";
import { ValidationError } from "@/shared/errors/domain";
import { revenues } from "../../../../../../node-only/schema/revenues";

export async function deleteRevenue(
  db: Database,
  id: RevenueId,
): Promise<void> {
  if (!id) {
    throw new ValidationError("Revenue ID is required");
  }

  const result = await db
    .delete(revenues)
    .where(eq(revenues.id, id))
    .returning();

  if (!result) {
    throw new DatabaseError("Failed to delete revenue record");
  }
}
