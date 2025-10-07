import "server-only";
import { mapDrizzleToDalError } from "@/server/errors/drizzle-errors";

/**
 * Execute a DAL operation and rethrow mapped errors (throwing style).
 * - Maps Drizzle/unknown errors to domain-safe errors via mapDrizzleToDalError.
 * - Keeps throwing semantics for services/actions that don't use Result<T, E>.
 */
export async function executeDalOrThrow<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw mapDrizzleToDalError(e);
  }
}
