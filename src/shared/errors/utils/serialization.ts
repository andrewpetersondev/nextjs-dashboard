import { isDev } from "@/shared/config/env-shared";
import { AppError } from "@/shared/errors/core/app-error";
import type { Result } from "@/shared/result/result.types";
import { tryCatch } from "@/shared/result/sync/result-sync";

const JSON_PREVIEW_MAX_LENGTH = 100;

function isSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely stringify a value to JSON, returning a Result.
 *
 * @param value - The value to stringify.
 * @param replacer - Optional replacer function for JSON.stringify.
 * @param space - Optional space parameter for JSON.stringify.
 * @returns A Result containing the JSON string or an AppError.
 */
export function safeStringifyResult(
  value: unknown,
  replacer?: (key: string, val: unknown) => unknown,
  space?: string | number,
): Result<string, AppError> {
  return tryCatch(
    () => JSON.stringify(value, replacer, space),
    (error) =>
      new AppError("validation", {
        message: "Failed to stringify value to JSON",
        metadata: { error: String(error) },
      }),
  );
}

/**
 * Safely parse a JSON string, returning a Result.
 *
 * @typeParam T - The expected type of the parsed value.
 * @param json - The JSON string to parse.
 * @returns A Result containing the parsed value or an AppError.
 */
export function safeParseJsonResult<T = unknown>(
  json: string,
): Result<T, AppError> {
  return tryCatch(
    () => JSON.parse(json) as T,
    (error) =>
      new AppError("validation", {
        message: "Failed to parse JSON string",
        metadata: {
          error: String(error),
          jsonPreview: json.slice(0, JSON_PREVIEW_MAX_LENGTH),
        },
      }),
  );
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

export function redactNonSerializable(value: unknown): unknown {
  if (value instanceof Error) {
    return { message: value.message, name: value.name };
  }
  try {
    JSON.stringify(value);
    return value;
  } catch {
    return { note: "non-serializable" };
  }
}

export function buildUnknownValueMetadata(
  value: unknown,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...extra,
    originalType: value === null ? "null" : typeof value,
    originalValue: redactNonSerializable(value),
  };
}

export function validateAndMaybeSanitizeMetadata(
  ctx: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(ctx).sort()) {
    const val = ctx[key];
    out[key] = isSerializable(val) ? val : redactNonSerializable(val);
  }
  return out;
}

export function deepFreezeDev<T>(obj: T): T {
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
      const v = (o as Record<string, unknown>)[key];
      if (v && typeof v === "object") {
        try {
          freeze(v as object);
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
