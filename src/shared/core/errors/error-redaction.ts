import {
  DEFAULT_MASK,
  DEFAULT_MAX_DEPTH,
  DEFAULT_SENSITIVE_KEYS,
} from "@/shared/core/errors/error-redaction.constants";
import {
  handleArray,
  handleObject,
  handlePrimitive,
} from "@/shared/core/errors/error-redaction.handlers";
import type {
  InternalConfig,
  RedactOptions,
} from "@/shared/core/errors/error-redaction.types";
import { buildSensitiveSet } from "@/shared/core/errors/error-redaction.utils";

/**
 * Create a visit function (closure over config + seen set).
 */
function createVisit(
  cfg: InternalConfig,
  seen: WeakSet<object>,
): (value: unknown, depth: number, keyHint?: string) => unknown {
  return function visit(
    value: unknown,
    depth: number,
    keyHint?: string,
  ): unknown {
    if (value === null) {
      return null;
    }
    if (depth > cfg.maxDepth) {
      return value;
    }
    // Primitive path
    const primitiveHandled = handlePrimitive(value, keyHint, cfg);
    if (
      primitiveHandled !== value ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint" ||
      typeof value === "symbol" ||
      typeof value === "undefined"
    ) {
      return primitiveHandled;
    }
    if (value instanceof Date || value instanceof RegExp) {
      return value;
    }
    if (Array.isArray(value)) {
      return handleArray({
        arr: value,
        cfg,
        depth,
        seen,
        walker: visit,
      });
    }
    if (typeof value === "object") {
      return handleObject({
        cfg,
        depth,
        obj: value as Record<string, unknown>,
        seen,
        walker: visit,
      });
    }
    return value;
  };
}

/**
 * Builds a context redactor compatible with logError's `redact` parameter.
 * Pure: never mutates the provided context object.
 */
export function createErrorContextRedactor(
  options?: RedactOptions,
): (
  ctx: Record<string, unknown> | undefined,
) => Record<string, unknown> | undefined {
  const {
    extraKeys = [],
    mask = DEFAULT_MASK,
    maxDepth = DEFAULT_MAX_DEPTH,
    partialMask = true,
  } = options ?? {};

  const cfg: InternalConfig = {
    mask,
    maxDepth,
    partialMask,
    sensitive: buildSensitiveSet(DEFAULT_SENSITIVE_KEYS, extraKeys),
  };

  return function redact(
    ctx: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined {
    if (!ctx) {
      return ctx;
    }
    const seen = new WeakSet<object>();
    const visit = createVisit(cfg, seen);

    let mutatedTop = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(ctx)) {
      const next = visit(v, 0, k);
      out[k] = next;
      if (next !== v) {
        mutatedTop = true;
      }
    }
    return mutatedTop ? out : ctx;
  };
}

/**
 * Default redactor with standard sensitive keys + partial masking.
 */
export const defaultErrorContextRedactor = createErrorContextRedactor();

// -----------------------------------------------------------------------------
// Example usage (do not place inside this file in production):
// import { logError } from './error-logger';
// import { defaultErrorContextRedactor } from './error-redaction';
// logError({ error, operation: 'UserSignup', extra: { requestId }, redact: defaultErrorContextRedactor });
// -----------------------------------------------------------------------------
