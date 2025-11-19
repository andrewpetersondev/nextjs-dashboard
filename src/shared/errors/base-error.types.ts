// src/shared/errors/base-error.types.ts
import type { AppErrorCode, Severity } from "@/shared/errors/error-codes";

type ImmutableRecord = Readonly<Record<string, unknown>>;

/**
 * Canonical metadata shared by all serialized error shapes.
 */
interface CanonicalErrorMetadata {
  readonly category: string;
  readonly code: AppErrorCode;
  readonly description: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly severity: Severity;
  readonly statusCode: number;
}

export type BaseErrorContext = ImmutableRecord;

export interface SerializedError
  extends Pick<CanonicalErrorMetadata, "code" | "message" | "statusCode"> {
  readonly context?: BaseErrorContext;
  readonly name: string;
  readonly timestamp: string;
}

export interface ErrorFactoryOptions {
  readonly cause?: Error;
  readonly context?: BaseErrorContext;
  readonly message?: string;
  readonly statusCode?: number;
}

/**
 * Immutable diagnostic context embedded directly on errors.
 */
export type ErrorContext = ImmutableRecord;

export interface BaseErrorJson extends CanonicalErrorMetadata {
  readonly context?: ErrorContext;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
}

export interface SerializedErrorCause {
  readonly code?: AppErrorCode;
  readonly message: string;
  readonly name: string;
  readonly severity?: Severity;
  readonly stack?: string;
}

export interface BaseErrorLogPayload extends BaseErrorJson {
  readonly cause?: SerializedErrorCause;
  readonly diagnosticId?: string;
  readonly originalCauseRedacted?: boolean;
  readonly originalCauseType?: string;
  readonly stack?: string;
  readonly validationErrorPresent?: boolean;
}

export interface BaseErrorOptions {
  readonly cause?: unknown;
  readonly context?: ErrorContext;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
  readonly message?: string;
}
