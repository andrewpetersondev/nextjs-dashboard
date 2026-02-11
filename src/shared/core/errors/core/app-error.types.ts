import type { AppErrorKey } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { AppErrorMetadata } from "@/shared/core/errors/metadata/error-metadata.value";

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

export type AppErrorDefinition = Readonly<{
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
  readonly overrideMetadata?: T;
};

export type AppErrorCoreDescriptor = Readonly<
  AppErrorDefinition & {
    readonly key: AppErrorKey;
  }
>;

export type AppErrorJsonDto<T extends AppErrorMetadata = AppErrorMetadata> =
  Readonly<
    AppErrorCoreDescriptor & {
      readonly _isAppError: true;
      readonly message: string;
      readonly metadata: T;
    }
  >;
