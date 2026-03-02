import type {
  AppErrorParams,
  UnexpectedErrorParams,
} from "@/shared/core/errors/core/app-error.dto";
import { AppError } from "@/shared/core/errors/core/app-error.entity";
import {
  APP_ERROR_KEYS,
  type AppErrorKey,
  type AppErrorMetadataValueByKey,
} from "@/shared/core/errors/core/catalog/app-error.registry";
import type { UnexpectedErrorMetadata } from "@/shared/core/errors/core/metadata/error-metadata.value";
import { redactNonSerializable } from "@/shared/core/errors/utils/serialization";

function buildUnknownErrorMetadata(
  value: unknown,
  extra: Record<string, unknown> = {},
): UnexpectedErrorMetadata {
  return {
    ...extra,
    originalType: value === null ? "null" : typeof value,
    originalValue: redactNonSerializable(value),
  };
}

function safeStringifyUnknown(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }

    const json = JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    const MaxLength = 10_000;
    if (json.length > MaxLength) {
      return `${json.slice(0, MaxLength)}…[truncated ${json.length - MaxLength} chars]`;
    }
    return json ?? String(value);
  } catch {
    return "Non-serializable thrown value";
  }
}

function normalizeCause(value: unknown): AppError | Error | string {
  if (value instanceof AppError || value instanceof Error) {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  return safeStringifyUnknown(value);
}

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
