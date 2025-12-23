import { isDev } from "@/shared/config/env-shared";
import {
  type AppErrorKey,
  getAppErrorCodeMeta,
} from "@/shared/errors/catalog/app-error.registry";
import type { AppErrorLayer } from "@/shared/errors/core/app-error.layers";
import type { AppErrorParams } from "@/shared/errors/core/app-error.params";
import type { AppErrorSeverity } from "@/shared/errors/core/app-error.severity";
import type { AppErrorJsonDto } from "@/shared/errors/core/app-error-json.dto";
import type { AppErrorMetadata } from "@/shared/errors/core/error-metadata.value";
import {
  deepFreezeDev,
  validateAndMaybeSanitizeMetadata,
} from "@/shared/errors/utils/app-error-entity.utils";

/**
 * Standardized application error with transport-agnostic error codes.
 *
 * @typeParam T - The type of the metadata associated with this error.
 * Must extend {@link AppErrorMetadata}. Defaults to {@link AppErrorMetadata} if not specified.
 * todo: default may be problematic
 */
export class AppError<
  T extends AppErrorMetadata = AppErrorMetadata,
> extends Error {
  readonly cause: AppError | Error | string;
  readonly description: string;
  readonly key: AppErrorKey;
  readonly layer: AppErrorLayer;
  readonly message: string;
  readonly metadata: T;
  readonly retryable: boolean;
  readonly severity: AppErrorSeverity;

  constructor(params: AppErrorParams<T>) {
    const { cause, key, message, metadata } = params;
    const meta = getAppErrorCodeMeta(key);

    // todo: what does this do exactly?
    // This invokes the base class constructor while optionally attaching an underlying error to the property,
    // but only if that cause is a valid error object; otherwise, it initializes without a nested cause. `cause`
    super(message, cause instanceof Error ? { cause } : undefined);

    this.name = this.constructor.name;
    this.cause = cause;
    this.description = meta.description;
    this.key = key;
    this.layer = meta.layer;
    this.message = message;
    this.retryable = meta.retryable;
    this.severity = meta.severity;

    const processedMetadata = validateAndMaybeSanitizeMetadata(key, metadata);
    this.metadata = isDev()
      ? deepFreezeDev(processedMetadata)
      : Object.freeze(processedMetadata);

    if (!isDev()) {
      try {
        Object.freeze(this);
      } catch {
        /* silent */
      }
    }
  }

  /**
   * Returns a plain object representation for manual serialization.
   */
  toJson(): AppErrorJsonDto<T> {
    return {
      description: this.description,
      key: this.key,
      layer: this.layer,
      message: this.message,
      metadata: this.metadata,
      retryable: this.retryable,
      severity: this.severity,
    };
  }
}
