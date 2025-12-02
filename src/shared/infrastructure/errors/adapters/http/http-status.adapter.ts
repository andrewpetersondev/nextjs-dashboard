import {
  HTTP_ERROR_MAP,
  type HttpResponsibility,
} from "@/shared/infrastructure/errors/adapters/http/http-status-codes";
import type { AppError } from "@/shared/infrastructure/errors/core/app-error.class";
import type { AppErrorJson } from "@/shared/infrastructure/errors/core/error.types";

export interface HttpErrorPayload extends AppErrorJson {
  readonly responsibility: HttpResponsibility;
  readonly statusCode: number;
}

/**
 * Map a AppError into HTTP response semantics.
 *
 * - Resolves status and responsibility using HTTP_ERROR_MAP
 * - Attaches them on top of the core AppErrorJson
 */
export function mapAppErrorToHttpPayload(error: AppError): HttpErrorPayload {
  const base: AppErrorJson = error.toJson();

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
