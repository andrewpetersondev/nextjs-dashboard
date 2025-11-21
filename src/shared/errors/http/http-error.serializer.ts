// src/shared/errors/http/http-error.serializer.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import type { BaseErrorJson } from "@/shared/errors/core/base-error.types";
import {
  HTTP_ERROR_MAP,
  type HttpResponsibility,
} from "@/shared/errors/http/http-error.map";

export interface HttpErrorPayload extends BaseErrorJson {
  readonly responsibility: HttpResponsibility;
  readonly statusCode: number;
}

/**
 * Map a BaseError into HTTP response semantics.
 *
 * - Resolves status and responsibility using HTTP_ERROR_MAP
 * - Attaches them on top of the core BaseErrorJson
 */
export function toHttpErrorPayload(error: BaseError): HttpErrorPayload {
  const base: BaseErrorJson = error.toJson();
  const httpDef = HTTP_ERROR_MAP[error.code] ?? {
    responsibility: "server" as const,
    status: 500,
  };

  return {
    ...base,
    responsibility: httpDef.responsibility,
    statusCode: httpDef.status,
  };
}
