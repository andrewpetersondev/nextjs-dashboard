import "server-only";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import { RevenueService } from "@/modules/revenues/server/application/services/revenue.service";
import { RevenueEventHandler } from "@/modules/revenues/server/events/handlers/revenue-event.handler";
import { RevenueRepository } from "@/modules/revenues/server/infrastructure/repository/revenue.repository";
import { getAppDb } from "@/server-core/db/db.connection";
import { logger } from "@/shared/logging/infrastructure/logging.client";

declare global {
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
      getAppDb(),
    );
    const service = new RevenueService(repository);
    globalForRevenueHandler.__revenueEventHandler = new RevenueEventHandler(
      service,
    );
    logger.info("RevenueEventHandler initialized", {
      context: "revenue-events.bootstrap",
    });
  } catch (error) {
    logger.error("Failed to initialize RevenueEventHandler", {
      context: "revenue-events.bootstrap",
      error,
    });
  }
}

// Export a no-op to make this a module; side-effects perform the bootstrapping.
export const revenueEventsBootstrapped = true;
