// src/shared/errors/core/base-error.types.ts
import type {
  AppErrorKey,
  AppErrorLayer,
  Severity,
} from "@/shared/errors/core/error-codes";

export type ErrorMetadata = Readonly<Record<string, unknown>>;
export type FieldErrors = Readonly<Record<string, readonly string[]>>;
export type FormErrors = readonly string[];

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
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
  readonly message: string;
  readonly metadata?: ErrorMetadata;
}

export interface BaseErrorOptions {
  readonly cause?: unknown;
  /** @deprecated Use metadata instead */
  readonly context?: ErrorMetadata;
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
  readonly message?: string;
  readonly metadata?: ErrorMetadata;
}
