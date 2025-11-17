// File: src/shared/errors/serialize-error.ts

import { BaseError, type BaseErrorJson } from "@/shared/errors/base-error";

export function serializeError(error: unknown): BaseErrorJson {
  const be = BaseError.from(error);
  return be.toJson();
}
