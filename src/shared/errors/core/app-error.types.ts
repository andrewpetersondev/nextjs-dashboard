import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { AppErrorMetadata } from "@/shared/errors/metadata/error-metadata.value";

export const APP_ERROR_SEVERITY = {
  ERROR: "ERROR",
  INFO: "INFO",
  WARN: "WARN",
} as const;

export type AppErrorSeverity = keyof typeof APP_ERROR_SEVERITY;

export const APP_ERROR_LAYER = {
  API: "API",
  APPLICATION: "APPLICATION",
  DOMAIN: "DOMAIN",
  INFRASTRUCTURE: "INFRASTRUCTURE",
  INTERNAL: "INTERNAL",
  UI: "UI",
} as const;

export type AppErrorLayer =
  (typeof APP_ERROR_LAYER)[keyof typeof APP_ERROR_LAYER];

export type AppErrorSchema = Readonly<{
  description: string;
  layer: AppErrorLayer;
  // TODO: REMOVE RETRYABLE PROPERTY
  retryable: boolean;
  severity: AppErrorSeverity;
}>;

export type AppErrorParams<T extends AppErrorMetadata = AppErrorMetadata> =
  Readonly<{
    readonly cause: AppError | Error | string;
    readonly key: AppErrorKey;
    readonly message: string;
    readonly metadata: T;
  }>;

export type UnexpectedErrorParams<
  T extends AppErrorMetadata = AppErrorMetadata,
> = Omit<AppErrorParams<T>, "cause" | "key" | "metadata"> & {
  readonly metadata?: T;
};

export type AppErrorCoreMetadata = Readonly<
  AppErrorSchema & {
    readonly key: AppErrorKey;
  }
>;

export type AppErrorJsonDto<T extends AppErrorMetadata = AppErrorMetadata> =
  Readonly<
    AppErrorCoreMetadata & {
      readonly _isAppError: true;
      readonly message: string;
      readonly metadata: T;
    }
  >;
