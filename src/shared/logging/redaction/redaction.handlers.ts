import { CIRCULAR_REF_PLACEHOLDER } from "@/shared/logging/redaction/redaction.constants";
import type {
  ArrayRedactOptions,
  InternalConfig,
  ObjectRedactOptions,
} from "@/shared/logging/redaction/redaction.types";
import {
  applyMask,
  isSensitiveKey,
} from "@/shared/logging/redaction/redaction.utils";

/**
 * Redact a primitive or return as-is.
 */
export function handlePrimitive(
  value: unknown,
  keyHint: string | undefined,
  cfg: InternalConfig,
): unknown {
  if (typeof value === "string") {
    return isSensitiveKey(cfg.sensitive, keyHint)
      ? applyMask(value, cfg.mask, cfg.partialMask, keyHint)
      : value;
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    typeof value === "symbol" ||
    typeof value === "undefined"
  ) {
    return value;
  }
  return value;
}

/**
 * Redact arrays (structure preserved, elements visited).
 */
export function handleArray(options: ArrayRedactOptions): unknown {
  const { arr, depth, seen, walker } = options;
  if (seen.has(arr)) {
    return CIRCULAR_REF_PLACEHOLDER;
  }
  seen.add(arr);
  let mutated = false;
  const out: unknown[] = [];
  for (const original of arr) {
    const masked = walker(original, depth + 1);
    out.push(masked);
    if (masked !== original) {
      mutated = true;
    }
  }
  return mutated ? out : arr;
}

/**
 * Redact plain objects (keys evaluated for sensitivity).
 */
export function handleObject(options: ObjectRedactOptions): unknown {
  const { obj, depth, cfg, seen, walker } = options;
  if (seen.has(obj)) {
    return CIRCULAR_REF_PLACEHOLDER;
  }
  seen.add(obj);
  let mutated = false;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    let maskedValue: unknown;
    if (isSensitiveKey(cfg.sensitive, k)) {
      maskedValue =
        typeof v === "string"
          ? applyMask(v, cfg.mask, cfg.partialMask, k)
          : cfg.mask;
    } else {
      maskedValue = walker(v, depth + 1, k);
    }
    out[k] = maskedValue;
    if (maskedValue !== v) {
      mutated = true;
    }
  }
  return mutated ? out : obj;
}
