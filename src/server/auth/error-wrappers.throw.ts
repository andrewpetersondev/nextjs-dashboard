import "server-only";
import { mapDrizzleToDalError } from "@/server/errors/mappers/drizzle-error-mapper";

// Add explicit generic constraint and name for clarity
type AsyncThunk<T> = () => Promise<T>;

/**
 * Execute a DAL operation and rethrow mapped errors (throwing style).
 * - Maps Drizzle/unknown errors to domain-safe errors via mapDrizzleToDalError.
 * - Keeps throwing semantics for services/actions that don't use Result<T, E>.
 */
export async function executeDalOrThrow<T>(fn: AsyncThunk<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw mapDrizzleToDalError(e);
  }
}
