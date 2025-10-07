import "server-only";
import type { DrizzleError } from "drizzle-orm";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

const UNIQUE_VIOLATION_CODE = "23505";
const uniqueConstraintRegex = /unique/i;

function hasKey<T extends string>(
  value: unknown,
  key: T,
): value is Record<T, unknown> {
  return typeof value === "object" && value !== null && key in value;
}

function readStringProp(
  err: unknown,
  key: "message" | "code" | "name" | "constraint",
): string {
  return hasKey(err, key) ? String(err[key] ?? "") : "";
}

export function isUniqueViolation(err: unknown): boolean {
  const code = readStringProp(err, "code");
  const name = readStringProp(err, "name");
  const message = readStringProp(err, "message");
  const constraint = readStringProp(err, "constraint");
  return (
    code === UNIQUE_VIOLATION_CODE ||
    name === "UniqueConstraintError" ||
    uniqueConstraintRegex.test(message) ||
    uniqueConstraintRegex.test(constraint)
  );
}

// Drizzle errors are plain objects with a known surface; we duck-type guard them.
export type DrizzleLikeError = {
  message?: unknown;
  code?: unknown;
  constraint?: unknown;
  name?: unknown;
};

export const isDrizzleQueryError = (
  e: unknown,
): e is DrizzleError | DrizzleLikeError => {
  return typeof e === "object" && e !== null;
};

/**
 * Map unknown or Drizzle errors into domain errors for DAL usage.
 * - Unique constraint -> ConflictError
 * - Otherwise -> DatabaseError
 */
export function mapDrizzleToDalError(
  e: unknown,
): DatabaseError | ConflictError {
  if (isUniqueViolation(e)) {
    serverLogger.warn(
      { context: "errors.mapDrizzleToDalError", kind: "conflict" },
      "Unique constraint violation detected",
    );
    return new ConflictError("A record with these values already exists.", {
      cause: e instanceof Error ? e : undefined,
    });
  }
  const message =
    typeof e === "object" && e !== null && "message" in e
      ? String((e as { message?: unknown }).message)
      : "Database operation failed.";
  return new DatabaseError(message, {}, e instanceof Error ? e : undefined);
}
