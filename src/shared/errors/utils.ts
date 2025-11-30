import { isDev } from "@/shared/config/env-shared";

function isSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

export function safeStringifyUnknown(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }
    const json = JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    const Max = 10_000;
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

/**
 * BFS to flatten the error chain, looking into common wrapper properties.
 * Useful for finding the root cause or specific metadata in nested errors.
 */
export function flattenErrorChain(root: unknown): Record<string, unknown>[] {
  if (!root || typeof root !== "object") {
    return [];
  }

  const queue: Record<string, unknown>[] = [root as Record<string, unknown>];
  const result: Record<string, unknown>[] = [];
  const seen = new Set<object>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);
    result.push(current);

    // Check common wrapper properties
    // We use a predefined list to avoid infinite recursion on arbitrary props
    const propsToCheck = ["cause", "originalError", "originalCause", "error"];
    for (const prop of propsToCheck) {
      const val = current[prop];
      if (val && typeof val === "object") {
        queue.push(val as Record<string, unknown>);
      }
    }
  }
  return result;
}
