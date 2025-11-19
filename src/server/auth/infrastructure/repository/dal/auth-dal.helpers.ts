// src/server/auth/infrastructure/dal/auth-dal.helpers.ts
import "server-only";
import type { AuthLogLayerContext } from "@/server/auth/logging-auth/auth-layer-context";
import { normalizePgError } from "@/shared/errors/pg-error.factory";

export function handleDalError(
  err: unknown,
  dalContext: AuthLogLayerContext<"infrastructure.dal">,
): never {
  const normalized = normalizePgError(err, {
    context: dalContext.loggerContext,
    identifiers: dalContext.identifiers,
    layer: dalContext.layer,
    operation: dalContext.operation,
  });

  throw normalized;
}
