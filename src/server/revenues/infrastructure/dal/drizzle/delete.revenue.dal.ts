import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { revenues } from "@/server/db/schema/revenues";
import { DatabaseError } from "@/server/errors/infrastructure";
import { ValidationError } from "@/shared/core/errors/domain";
import type { RevenueId } from "@/shared/domain/domain-brands";

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
