import {
  DEFAULT_MASK,
  DEFAULT_MAX_DEPTH,
  DEFAULT_SENSITIVE_KEYS,
} from "@/shared/logging/redaction/redaction.constants";
import {
  handleArray,
  handleObject,
  handlePrimitive,
} from "@/shared/logging/redaction/redaction.handlers";
import type {
  InternalConfig,
  RedactOptions,
} from "@/shared/logging/redaction/redaction.types";
import { buildSensitiveSet } from "@/shared/logging/redaction/redaction.utils";

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
 * Build a normalized redaction config from options.
 */
function buildConfig(options?: RedactOptions): InternalConfig {
  const {
    extraKeys = [],
    mask = DEFAULT_MASK,
    maxDepth = DEFAULT_MAX_DEPTH,
    partialMask = true,
  } = options ?? {};

  return {
    mask,
    maxDepth,
    partialMask,
    sensitive: buildSensitiveSet(DEFAULT_SENSITIVE_KEYS, extraKeys),
  };
}

/**
 * Create a fresh visitor for each redaction run.
 */
function makeVisitor(cfg: InternalConfig) {
  return () => {
    const seen = new WeakSet<object>();
    return createVisit(cfg, seen);
  };
}

/**
 * Builds a generic redactor for arbitrary log or error data.
 *
 * - Pure: never mutates the provided value.
 * - Safe: guards against circular references per invocation.
 */
export function createRedactor(
  options?: RedactOptions,
): (value: unknown) => unknown {
  const cfg = buildConfig(options);
  const getVisitor = makeVisitor(cfg);

  return function redact(value: unknown): unknown {
    const visit = getVisitor();
    return visit(value, 0);
  };
}
