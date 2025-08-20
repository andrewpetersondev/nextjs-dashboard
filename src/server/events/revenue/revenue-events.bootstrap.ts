import "server-only";

import { getDB } from "@/server/db/connection";
import { RevenueEventHandler } from "@/server/events/revenue/revenue-event.handler";
import { logger } from "@/server/logging/logger";
import { RevenueRepository } from "@/server/repositories/revenue.repository";
import type { RevenueRepositoryInterface } from "@/server/repositories/revenue.repository.interface";
import { RevenueService } from "@/server/services/revenue.service";

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
