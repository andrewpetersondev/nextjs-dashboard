import "server-only";

import { getAppDb } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { RevenueService } from "@/server/revenues/application/services/revenue/revenue.service";
import { RevenueEventHandler } from "@/server/revenues/events/handlers/revenue-event.handler";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import { RevenueRepository } from "@/server/revenues/infrastructure/repository/repository";

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
    serverLogger.info({
      context: "revenue-events.bootstrap",
      message: "RevenueEventHandler initialized",
    });
  } catch (error) {
    serverLogger.error({
      context: "revenue-events.bootstrap",
      error,
      message: "Failed to initialize RevenueEventHandler",
    });
  }
}

// Export a no-op to make this a module; side-effects perform the bootstrapping.
export const revenueEventsBootstrapped = true;
