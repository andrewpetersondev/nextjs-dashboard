import { isDev } from "@/shared/config/env-shared";
import {
  type AppErrorKey,
  getAppErrorCodeMeta,
} from "@/shared/errors/catalog/app-error.registry";
import type {
  AppErrorJsonDto,
  AppErrorLayer,
  AppErrorParams,
  AppErrorSeverity,
} from "@/shared/errors/core/app-error.types";
import type { AppErrorMetadata } from "@/shared/errors/metadata/error-metadata.value";
import {
  deepFreezeDev,
  validateAndMaybeSanitizeMetadata,
} from "@/shared/errors/utils/app-error-entity.utils";

/**
 * Standardized application error with transport-agnostic error codes.
 *
 * @typeParam T - The type of the metadata associated with this error.
 * Must extend {@link AppErrorMetadata}. Defaults to {@link AppErrorMetadata} if not specified.
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
      _isAppError: true,
      description: this.description,
      key: this.key,
      layer: this.layer,
      message: this.message,
      metadata: this.metadata,
      retryable: this.retryable,
      severity: this.severity,
    };
  }

  /**
   * Reconstructs an AppError instance from a plain object DTO.
   * Useful for hydrating errors received from a network request or Server Action.
   */
  static fromDto<TMeta extends AppErrorMetadata = AppErrorMetadata>(
    dto: AppErrorJsonDto<TMeta>,
  ): AppError<TMeta> {
    return new AppError<TMeta>({
      cause: "hydrated",
      key: dto.key,
      message: dto.message,
      metadata: dto.metadata,
    });
  }
}

/**
 * Checks whether a value is an `AppError` instance.
 *
 * @param val - The value to check.
 * @returns `true` if `val` is an instance of `AppError`, otherwise `false`.
 */
export function isAppError(val: unknown): val is AppError {
  return val instanceof AppError;
}

/**
 * Checks whether a value is a plain object representation of an `AppError`.
 * Useful for validating data received across boundaries (e.g., from a Server Action).
 *
 * @param val - The value to check.
 * @returns `true` if `val` matches the shape of an `AppErrorJsonDto`, otherwise `false`.
 */
export function isAppErrorJson(val: unknown): val is AppErrorJsonDto {
  if (typeof val !== "object" || val === null) {
    return false;
  }

  const candidate = val as Record<string, unknown>;

  return (
    candidate._isAppError === true &&
    typeof candidate.key === "string" &&
    typeof candidate.message === "string"
  );
}
