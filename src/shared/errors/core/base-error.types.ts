// src/shared/errors/core/base-error.types.ts
import type {
  AppErrorKey,
  AppErrorLayer,
  Severity,
} from "@/shared/errors/core/error-codes";

/**
 * Canonical metadata shared by all serialized error shapes.
 */
export interface CanonicalErrorMetadata {
  readonly code: AppErrorKey;
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}

export interface BaseErrorJson extends CanonicalErrorMetadata {
  // Deprecated: prefer \`metadata\`
  readonly context?: ErrorContext;
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
  readonly message: string;
  readonly metadata?: ErrorContext;
}

export type ErrorContext = Readonly<Record<string, unknown>>;

export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export type FormErrors = readonly string[];

export interface BaseErrorOptions {
  readonly cause?: unknown;
  // Deprecated: prefer \`metadata\`
  readonly context?: ErrorContext;
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
  readonly message?: string;
  readonly metadata?: ErrorContext;
}
