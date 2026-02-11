import { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { UnexpectedErrorMetadata } from "@/shared/core/errors/metadata/error-metadata.value";
import { redactNonSerializable } from "@/shared/core/errors/utils/serialization";

export function buildUnknownErrorMetadata(
  value: unknown,
  extra: Record<string, unknown> = {},
): UnexpectedErrorMetadata {
  return {
    ...extra,
    originalType: value === null ? "null" : typeof value,
    originalValue: redactNonSerializable(value),
  };
}

export function safeStringifyUnknown(value: unknown): string {
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

export function normalizeCause(value: unknown): AppError | Error | string {
  if (value instanceof AppError || value instanceof Error) {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  return safeStringifyUnknown(value);
}
