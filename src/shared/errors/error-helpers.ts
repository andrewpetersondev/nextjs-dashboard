// src/shared/errors/error-helpers
import { isDev } from "@/shared/config/env-shared";
import type { ErrorContext } from "@/shared/errors/base-error.types";

export function safeStringifyUnknown(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }
    const json = JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    const Max = 10_000; // limit ~10KB
    if (json.length > Max) {
      return `${json.slice(0, Max)}…[truncated ${json.length - Max} chars]`;
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

// Shallow-deep freeze for dev to discourage mutation without heavy perf cost
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
          // ignore circular or non-configurable props
        }
      }
    }
    try {
      Object.freeze(o);
    } catch {
      // ignore non-extensible targets
    }
  };
  freeze(obj as unknown as object);
  return obj;
}

// Dev-only: ensure context is JSON-serializable; redact offending entries
export function validateAndMaybeSanitizeContext(
  ctx: ErrorContext,
): ErrorContext {
  if (!isDev()) {
    return ctx;
  }

  // Warn about likely misplaced logging metadata. TODO: MOVE THIS TO A CENTRAL LOCATION
  const loggingKeys = [
    "requestId",
    "hostname",
    "traceId",
    "spanId",
    "environment",
  ];
  const foundKeys = loggingKeys.filter((k) => k in ctx);
  if (foundKeys.length > 0) {
    console.warn(
      "[BaseError] Context contains logging-like keys that should use LoggingContext instead:",
      foundKeys.join(", "),
    );
  }

  // Existing serialization validation...
  try {
    JSON.stringify(ctx);
    return ctx;
  } catch {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(ctx)) {
      try {
        JSON.stringify(v);
        sanitized[k] = v;
      } catch {
        console.warn("[BaseError] Redacted non-serializable context value:", k);
        sanitized[k] = redactNonSerializable(v);
      }
    }
    try {
      JSON.stringify(sanitized);
      return sanitized;
    } catch {
      return { note: "context-redacted-non-serializable" };
    }
  }
}
