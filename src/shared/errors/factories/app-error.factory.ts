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

/**
 * Primary factory for creating structured application errors.
 * Use this directly for most domain and application errors.
 */
export function makeAppError<Key extends AppErrorKey>(
  key: Key,
  params: Omit<AppErrorParams<AppErrorMetadataValueByCode[Key]>, "key">,
): AppError<AppErrorMetadataValueByCode[Key]> {
  return new AppError<AppErrorMetadataValueByCode[Key]>({
    ...params,
    key,
  });
}

/**
 * Normalizes any unknown thrown value into a structured AppError.
 */
export function normalizeUnknownToAppError<Key extends AppErrorKey>(
  error: unknown,
  fallbackKey: Key,
): AppError<AppErrorMetadataValueByCode[Key]> {
  if (error instanceof AppError) {
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
 * Standard factory for unexpected (bug) errors.
 * It normalizes the 'error' (the trigger) and attaches it as the cause.
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
