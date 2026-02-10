import { isDev } from "@/shared/config/env-shared";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import {
  type AppErrorMetadata,
  getMetadataSchemaForCode,
} from "@/shared/errors/metadata/error-metadata.value";
import { redactNonSerializable } from "@/shared/errors/utils/serialization";

function validateMetadataByCode<T extends AppErrorMetadata>(
  code: AppErrorKey,
  metadata: T,
): T {
  try {
    const schema = getMetadataSchemaForCode(code);
    return schema.parse(metadata) as T;
  } catch (err) {
    // In dev, fail fast on metadata validation
    if (isDev()) {
      console.error(`Metadata validation failed for code "${code}":`, err);
      throw new Error(
        `Invalid metadata for error code "${code}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    // In prod, log but return the metadata as-is to avoid crashing
    return metadata;
  }
}

export function validateAndMaybeSanitizeMetadata<T extends AppErrorMetadata>(
  code: AppErrorKey,
  ctx: T,
): T {
  // First validate the shape
  const validated = validateMetadataByCode(code, ctx);

  // Then sanitize non-serializable values
  const source = validated as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  // Avoid unnecessary sorting if not in dev (sorting helps with stable log outputs/diffs)
  const keys = isDev() ? Object.keys(source).sort() : Object.keys(source);

  for (const key of keys) {
    out[key] = redactNonSerializable(source[key]);
  }
  return out as T;
}

export function deepFreezeDev<T>(obj: T): T {
  if (
    !isDev() ||
    obj === null ||
    typeof obj !== "object" ||
    Object.isFrozen(obj)
  ) {
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
