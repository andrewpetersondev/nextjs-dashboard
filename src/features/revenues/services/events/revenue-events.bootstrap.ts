import "server-only";

import { RevenueRepository } from "@/features/revenues/repository/revenue.repository";
import type { RevenueRepositoryInterface } from "@/features/revenues/repository/revenue.repository.interface";
import { RevenueEventHandler } from "@/features/revenues/services/events/revenue-event.handler";
import { RevenueService } from "@/features/revenues/services/revenue.service";
import { logger } from "@/lib/logging/logger";
import { getDB } from "@/server/db/connection";

declare global {
  // Use var for global augmentation compatibility
  // eslint-disable-next-line no-var
  var __revenueEventHandler: RevenueEventHandler | undefined;
}

// Ensure single initialization across hot reloads / serverless invocations
// by storing the instance on the global object.
const globalForRevenueHandler = globalThis as typeof globalThis & {
  __revenueEventHandler?: RevenueEventHandler;
};

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
