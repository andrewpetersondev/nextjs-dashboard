// src/shared/core/errors/error-redaction.ts

// Extracted constants for magic numbers and regex
const DEFAULT_MASK = "***REDACTED***" as const;
const DEFAULT_MAX_DEPTH = 4 as const;
const PARTIAL_MASK_VISIBLE_EMAIL_CHARS = 1 as const;
const PARTIAL_MASK_MIN_LENGTH = 16 as const;
const PARTIAL_MASK_VISIBLE_START_CHARS = 4 as const;
const PARTIAL_MASK_VISIBLE_END_CHARS = 4 as const;
const CIRCULAR_REF_PLACEHOLDER = "[Circular]" as const;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface InternalConfig {
  readonly mask: string;
  readonly maxDepth: number;
  readonly partialMask: boolean;
  readonly sensitive: Set<string>;
}

/**
 * Builds the sensitive key set (case-insensitive).
 */
function buildSensitiveSet(
  base: readonly string[],
  extra: readonly string[],
): Set<string> {
  return new Set([...base, ...extra].map((k) => k.toLowerCase()));
}

/**
 * Decide if a key is sensitive.
 */
function isSensitiveKey(sensitive: Set<string>, key?: string): boolean {
  if (!key) {
    return false;
  }
  return sensitive.has(key.toLowerCase());
}

/**
 * Apply masking rules to a string value.
 */
function applyMask(
  value: string,
  mask: string,
  partial: boolean,
  _keyHint?: string,
): string {
  if (!partial) {
    return mask;
  }
  if (isEmail(value)) {
    const [user, domain] = value.split("@");
    if (!user || !domain) {
      return mask;
    }
    const visible = user.slice(0, PARTIAL_MASK_VISIBLE_EMAIL_CHARS);
    return `${visible}***@${domain}`;
  }
  if (value.length > PARTIAL_MASK_MIN_LENGTH) {
    return `${value.slice(0, PARTIAL_MASK_VISIBLE_START_CHARS)}***${value.slice(-PARTIAL_MASK_VISIBLE_END_CHARS)}`;
  }
  return mask;
}

/**
 * Checks if a string is a valid email address.
 * @param v - The string to validate.
 * @returns True if the string matches the email pattern, false otherwise.
 */
function isEmail(v: string): boolean {
  return EMAIL_REGEX.test(v);
}

/**
 * Redact a primitive or return as-is.
 */
function handlePrimitive(
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

interface ArrayRedactOptions {
  arr: unknown[];
  depth: number;
  cfg: InternalConfig;
  seen: WeakSet<object>;
  walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

/**
 * Redact arrays (structure preserved, elements visited).
 */
function handleArray(options: ArrayRedactOptions): unknown {
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

interface ObjectRedactOptions {
  obj: Record<string, unknown>;
  depth: number;
  cfg: InternalConfig;
  seen: WeakSet<object>;
  walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

/**
 * Redact plain objects (keys evaluated for sensitivity).
 */
function handleObject(options: ObjectRedactOptions): unknown {
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
 * Sensitive key identifiers (case-insensitive).
 * Extend cautiously; avoid over-redaction that obscures diagnostics.
 */
export const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  "password",
  "pass",
  "pwd",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "apiKey",
  "api_key",
  "clientSecret",
  "privateKey",
  "email",
] as const;

export interface RedactOptions {
  readonly extraKeys?: readonly string[];
  readonly mask?: string;
  readonly maxDepth?: number;
  readonly partialMask?: boolean;
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
