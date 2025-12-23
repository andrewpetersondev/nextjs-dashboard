import {
  APP_ERROR_KEYS,
  type AppErrorKey,
  type AppErrorMetadataValueByCode,
} from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error.entity";
import type {
  AppErrorParams,
  UnexpectedErrorParams,
} from "@/shared/errors/core/app-error.params";
import type { UnexpectedErrorMetadata } from "@/shared/errors/core/error-metadata.value";
import {
  buildUnknownValueMetadata,
  safeStringifyUnknown,
  toCauseUnion,
} from "@/shared/errors/factories/app-error-factory.utils";

export function createAppError<Key extends AppErrorKey>(
  params: AppErrorParams<AppErrorMetadataValueByCode[Key]>,
): AppError<AppErrorMetadataValueByCode[Key]> {
  return new AppError<AppErrorMetadataValueByCode[Key]>(params);
}

/**
 * Creates an AppError for a specific key.
 */
export function makeAppError<Key extends AppErrorKey>(
  key: Key,
  params: Omit<AppErrorParams<AppErrorMetadataValueByCode[Key]>, "key">,
): AppError<AppErrorMetadataValueByCode[Key]> {
  // We construct the object explicitly to help TS inference without 'as'
  const fullParams: AppErrorParams<AppErrorMetadataValueByCode[Key]> = {
    cause: params.cause,
    key,
    message: params.message,
    metadata: params.metadata,
  };
  return createAppError<Key>(fullParams);
}

/**
 * Normalizes any unknown thrown value into a structured AppError.
 */
export function normalizeUnknownToAppError<Key extends AppErrorKey>(
  error: unknown,
  fallbackKey: Key,
): AppError<AppErrorMetadataValueByCode[Key]> {
  if (error instanceof AppError) {
    // If it's already an AppError, we return it.
    // Note: The caller expects AppError<MetadataByCode[Key]>,
    // but a pre-existing AppError might have different metadata.
    // In normalization contexts, we usually return it as the base AppError.
    return error as AppError<AppErrorMetadataValueByCode[Key]>;
  }
  const cause = toCauseUnion(error);
  if (cause instanceof Error) {
    return makeAppError(fallbackKey, {
      cause,
      message: cause.message,
      metadata: {} as AppErrorMetadataValueByCode[Key],
    });
  }
  return makeAppError(fallbackKey, {
    cause,
    message: safeStringifyUnknown(error),
    metadata: buildUnknownValueMetadata(
      error,
    ) as AppErrorMetadataValueByCode[Key],
  });
}

/**
 * Standard factory for unexpected (bug) errors, capturing the trigger error as cause.
 */
export function makeUnexpectedError(
  error: unknown,
  params: UnexpectedErrorParams<UnexpectedErrorMetadata>,
): AppError<UnexpectedErrorMetadata> {
  const normalized = normalizeUnknownToAppError(
    error,
    APP_ERROR_KEYS.unexpected,
  );

  return makeAppError(APP_ERROR_KEYS.unexpected, {
    cause: normalized.cause,
    message: params.message,
    metadata: {
      ...normalized.metadata,
      ...params.metadata,
    },
  });
}

export function makeValidationError(
  params: Omit<
    AppErrorParams<AppErrorMetadataValueByCode["validation"]>,
    "key"
  >,
): AppError<AppErrorMetadataValueByCode["validation"]> {
  return makeAppError(APP_ERROR_KEYS.validation, params);
}

export function makeIntegrityError(
  params: Omit<AppErrorParams<AppErrorMetadataValueByCode["integrity"]>, "key">,
): AppError<AppErrorMetadataValueByCode["integrity"]> {
  return makeAppError(APP_ERROR_KEYS.integrity, params);
}

export function makeInfrastructureError(
  params: Omit<
    AppErrorParams<AppErrorMetadataValueByCode["infrastructure"]>,
    "key"
  >,
): AppError<AppErrorMetadataValueByCode["infrastructure"]> {
  return makeAppError(APP_ERROR_KEYS.infrastructure, params);
}
