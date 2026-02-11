import {
  APP_ERROR_KEYS,
  type AppErrorKey,
  type AppErrorMetadataValueByKey,
} from "@/shared/core/errors/catalog/app-error.registry";
import { AppError } from "@/shared/core/errors/core/app-error.entity";
import type {
  AppErrorParams,
  UnexpectedErrorParams,
} from "@/shared/core/errors/core/app-error.types";
import {
  buildUnknownErrorMetadata,
  normalizeCause,
  safeStringifyUnknown,
} from "@/shared/core/errors/factories/app-error-factory.utils";
import type { UnexpectedErrorMetadata } from "@/shared/core/errors/metadata/error-metadata.value";

/**
 * Primary factory for creating structured application errors.
 * Use this directly for most domain and application errors.
 */
export function makeAppError<Key extends AppErrorKey>(
  key: Key,
  params: Omit<AppErrorParams<AppErrorMetadataValueByKey[Key]>, "key">,
): AppError<AppErrorMetadataValueByKey[Key]> {
  return new AppError<AppErrorMetadataValueByKey[Key]>({
    ...params,
    key,
  });
}

/**
 * Normalizes any unknown thrown value into a structured AppError.
 */
export function normalizeUnknownError<Key extends AppErrorKey>(
  error: unknown,
  fallbackKey: Key,
): AppError<AppErrorMetadataValueByKey[Key]> {
  if (error instanceof AppError) {
    return error as AppError<AppErrorMetadataValueByKey[Key]>;
  }
  const cause = normalizeCause(error);
  if (cause instanceof Error) {
    return makeAppError(fallbackKey, {
      cause,
      message: cause.message,
      metadata: {} as AppErrorMetadataValueByKey[Key],
    });
  }
  return makeAppError(fallbackKey, {
    cause,
    message: safeStringifyUnknown(error),
    metadata: buildUnknownErrorMetadata(
      error,
    ) as AppErrorMetadataValueByKey[Key],
  });
}

/**
 * Standard factory for unexpected (bug) errors.
 * It normalizes the 'error' (the trigger) and attaches it as the cause.
 * @remarks
 * params.metadata overrides normalized metadata for the same keys
 */
export function makeUnexpectedError(
  error: unknown,
  params: UnexpectedErrorParams<UnexpectedErrorMetadata>,
): AppError<UnexpectedErrorMetadata> {
  const cause = normalizeCause(error);
  const normalized = normalizeUnknownError(error, APP_ERROR_KEYS.unexpected);

  return makeAppError(APP_ERROR_KEYS.unexpected, {
    cause,
    message: params.message,
    metadata: {
      ...normalized.metadata,
      ...params.overrideMetadata,
    },
  });
}
