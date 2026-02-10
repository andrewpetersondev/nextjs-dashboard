import {
  type AppErrorKey,
  getMetadataSchemaForKey,
} from "@/shared/errors/catalog/app-error.registry";
import type { AppErrorMetadata } from "@/shared/errors/metadata/error-metadata.value";
import { redactNonSerializable } from "@/shared/errors/utils/serialization";

function validateMetadataByCode<T extends AppErrorMetadata>(
  code: AppErrorKey,
  metadata: T,
): T {
  try {
    const schema = getMetadataSchemaForKey(code);
    return schema.parse(metadata) as T;
  } catch (err) {
    console.error(`Metadata validation failed for code "${code}":`, err);
    return metadata;
  }
}

export function validateAndMaybeSanitizeMetadata<T extends AppErrorMetadata>(
  code: AppErrorKey,
  ctx: T,
): T {
  const validated = validateMetadataByCode(code, ctx);

  const source = validated as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  const keys = Object.keys(source).sort();

  for (const key of keys) {
    out[key] = redactNonSerializable(source[key]);
  }
  return out as T;
}

/**
 * Deep-freezes an object graph best-effort.
 * @remarks
 * This is intentionally environment-agnostic to keep the errors layer independent of config/env.
 */
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object" || Object.isFrozen(obj)) {
    return obj;
  }
  const seen = new WeakSet<object>();
  const freeze = (o: object): void => {
    if (seen.has(o)) {
      return;
    }
    seen.add(o);

    const propertyNames = Object.getOwnPropertyNames(o);
    for (const name of propertyNames) {
      const value = (o as Record<string, unknown>)[name];
      if (value && typeof value === "object") {
        try {
          freeze(value);
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

  freeze(obj as object);
  return obj;
}
