import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";

/**
 * @deprecated
 */
export const _throwRepoDatabaseErr = (
  message: string,
  cause?: unknown,
): never => {
  throw new DatabaseError(
    message,
    { layer: "repository" },
    cause instanceof Error ? cause : undefined,
  );
};
