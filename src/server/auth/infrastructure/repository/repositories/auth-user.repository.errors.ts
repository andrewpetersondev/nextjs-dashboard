import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { isBaseError } from "@/shared/core/errors/base/base-error";
import { getErrorCodeMeta } from "@/shared/core/errors/base/error-codes";

export function isRepoKnownError(err: unknown): boolean {
  // narrow to our canonical error types only
  return (
    err instanceof DatabaseError ||
    (isBaseError(err) && Boolean(getErrorCodeMeta(err.code)))
  );
}
