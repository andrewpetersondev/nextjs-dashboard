import { isDev } from "@/shared/config/env-shared";
import {
  type AppErrorKey,
  getAppErrorCodeMeta,
} from "@/shared/errors/catalog/app-error.registry";
import type { AppErrorLayer } from "@/shared/errors/core/app-error.layers";
import type { AppErrorParams } from "@/shared/errors/core/app-error.params";
import type { Severity } from "@/shared/errors/core/app-error.severity";
import type { AppErrorJsonDto } from "@/shared/errors/core/app-error-json.dto";
import type { ErrorMetadataValue } from "@/shared/errors/core/error-metadata.value";
import { redactNonSerializable } from "@/shared/errors/utils/serialization";

function validateAndMaybeSanitizeMetadata<T extends ErrorMetadataValue>(
  ctx: T,
): T {
  const source = ctx as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    out[key] = redactNonSerializable(source[key]);
  }
  return out as T;
}

function deepFreezeDev<T>(obj: T): T {
  if (!isDev() || obj === null || typeof obj !== "object") {
    return obj;
  }
  const seen = new WeakSet<object>();
  const freeze = (o: object): void => {
    if (seen.has(o)) {
      return;
    }
    seen.add(o);

    for (const key of Object.getOwnPropertyNames(o)) {
      const value = (o as Record<string, unknown>)[key];
      if (value && typeof value === "object") {
        try {
          freeze(value as object);
        } catch {
          /* silent */
        }
      }
    }
    try {
      Object.freeze(o);
    } catch {
      /* silent */
    }
  };
  freeze(obj as unknown as object);
  return obj;
}

/**
 * Standardized application error with transport-agnostic error codes.
 */
export class AppError<
  T extends ErrorMetadataValue = ErrorMetadataValue,
> extends Error {
  readonly code: AppErrorKey;
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly metadata: T;
  readonly originalCause: unknown;
  readonly retryable: boolean;
  readonly severity: Severity;

  constructor(code: AppErrorKey, options: AppErrorParams<T>) {
    const meta = getAppErrorCodeMeta(code);

    const { cause, message, metadata } = options;

    const sanitizedCause =
      cause instanceof Error || cause === undefined
        ? cause
        : redactNonSerializable(cause);

    if (sanitizedCause === undefined) {
      super(message);
    } else {
      super(message, { cause: sanitizedCause });
    }

    this.code = code;
    this.description = meta.description;
    this.layer = meta.layer;
    this.name = this.constructor.name;
    this.originalCause = cause;
    this.retryable = meta.retryable;
    this.severity = meta.severity;

    const checkedMetadata = isDev()
      ? validateAndMaybeSanitizeMetadata(metadata)
      : metadata;

    this.metadata = (
      isDev() ? deepFreezeDev(checkedMetadata) : Object.freeze(checkedMetadata)
    ) as T;

    try {
      Object.freeze(this);
    } catch {
      /* silent */
    }
  }

  toJson(): AppErrorJsonDto<T> {
    return {
      code: this.code,
      description: this.description,
      layer: this.layer,
      message: this.message,
      metadata: this.metadata,
      retryable: this.retryable,
      severity: this.severity,
    };
  }
}
