// src/server/auth/infrastructure/dal/auth-dal.helpers.ts
import "server-only";
import type { AuthLayerContext } from "@/server/auth/logging-auth/auth-layer-context";
import { normalizePgError } from "@/shared/errors/pg-error.factory";

export function handleDalError(
  err: unknown,
  dalContext: AuthLayerContext<"infrastructure.dal">,
): never {
  const normalized = normalizePgError(err, {
    context: dalContext.context,
    identifiers: dalContext.identifiers,
    layer: dalContext.layer,
    operation: dalContext.operation,
  });

  throw normalized;
}
