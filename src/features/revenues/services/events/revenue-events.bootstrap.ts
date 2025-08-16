import "server-only";

import { getDB } from "@/db/connection";
import { RevenueRepository } from "@/features/revenues/repository/revenue.repository";
import type { RevenueRepositoryInterface } from "@/features/revenues/repository/revenue.repository.interface";
import { RevenueEventHandler } from "@/features/revenues/services/events/revenue-event.handler";
import { RevenueService } from "@/features/revenues/services/revenue.service";
import { logger } from "@/lib/logging/logger";

// Ensure single initialization across hot reloads / serverless invocations
// by storing the instance on the global object.
const globalForRevenueHandler = globalThis as any;

if (!globalForRevenueHandler.__revenueEventHandler) {
  try {
    const repository: RevenueRepositoryInterface = new RevenueRepository(
      getDB(),
    );
    const service = new RevenueService(repository);
    globalForRevenueHandler.__revenueEventHandler = new RevenueEventHandler(
      service,
    );
    logger.info({
      context: "revenue-events.bootstrap",
      message: "RevenueEventHandler initialized",
    });
  } catch (error) {
    logger.error({
      context: "revenue-events.bootstrap",
      error,
      message: "Failed to initialize RevenueEventHandler",
    });
  }
}

// Export a no-op to make this a module; side-effects perform the bootstrapping.
export const revenueEventsBootstrapped = true;
