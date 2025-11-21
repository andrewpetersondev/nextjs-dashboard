import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { revenues } from "@/server/db/schema/revenues";
import type { RevenueId } from "@/shared/branding/domain-brands";
import { BaseError } from "@/shared/errors/core/base-error";

export async function deleteRevenue(
  db: AppDatabase,
  id: RevenueId,
): Promise<void> {
  if (!id) {
    throw new BaseError("validation", { message: "Revenue ID is required" });
  }

  const result = await db
    .delete(revenues)
    .where(eq(revenues.id, id))
    .returning();

  if (!result) {
    throw new BaseError("database", {
      message: "Failed to delete revenue record",
    });
  }
}
