import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type {
  AppErrorLayer,
  Severity,
} from "@/shared/errors/core/app-error.schema";

/**
 * Generic error metadata container.
 *
 * Common metadata patterns by layer:
 * - **Database/Infrastructure**: `pgCode`, `constraint`, `table`, `operation`
 * - **Validation/Forms**: `fieldErrors`, `formErrors`, `values`
 * - **All layers**: `diagnosticId`, `operation`, `identifiers`
 *
 * @example
 * // Database error with PG metadata
 * { table: "users", constraint: "users_email_key", pgCode: "23505" }
 *
 * @example
 * // Form validation error
 * { fieldErrors: { email: ["required"] }, formErrors: ["Invalid input"] }
 *
 * @example
 * // Service layer with operation context
 * { operation: "signup", identifiers: { email: "user@example.com" } }
 */
export type ErrorMetadata = Readonly<Record<string, unknown>>;

/**
 * Core metadata shared by all errors.
 */
export interface ErrorCoreMetadata {
  readonly code: AppErrorKey;
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly retryable: boolean;
  readonly severity: Severity;
}

/**
 * JSON shape for serialization.
 */
export interface AppErrorJson extends ErrorCoreMetadata {
  readonly message: string;
  readonly metadata: ErrorMetadata;
}

/**
 * Options for constructing an AppError.
 */
export interface AppErrorOptions {
  readonly cause?: unknown;
  readonly message: string;
  readonly metadata: ErrorMetadata;
}
