import "server-only";
import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import { RevenueApplicationService } from "@/modules/revenues/application/services/revenue-application.service";
import { RevenueEventHandler } from "@/modules/revenues/events/handlers/revenue-event.handler";
import { RevenueRepository } from "@/modules/revenues/infrastructure/repository/revenue.repository";
import { getAppDb } from "@/server/db/db.connection";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

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
    const repository: RevenueRepositoryContract = new RevenueRepository(
      getAppDb(),
    );
    const service = new RevenueApplicationService(repository);
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
