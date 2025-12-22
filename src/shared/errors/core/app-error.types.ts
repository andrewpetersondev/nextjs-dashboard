import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";

/**
 * Generic error metadata container.
 *
 * @remarks
 * Prefer narrow, integration-specific metadata types (for example from
 * `app-error-metadata.types`) at the boundaries, but this remains the
 * canonical, transport-agnostic bag of additional details.
 *
 * Common metadata patterns by layer:
 * - Database/Infrastructure: `pgCode`, `constraint`, `table`, `operation`
 * - Validation/Forms: `fieldErrors`, `formErrors`, `values`
 * - All layers: `diagnosticId`, `operation`, `identifiers`
 */
export type ErrorMetadata = Readonly<Record<string, unknown>>;

/**
 * Core metadata shared by all errors.
 *
 * @remarks
 * This is intentionally aligned with {@link AppErrorSchema} so adding a field
 * to the registry schema is reflected here automatically.
 */
export type ErrorCoreMetadata = Readonly<
  AppErrorSchema & {
    readonly code: AppErrorKey;
  }
>;

/**
 * JSON shape for serialization.
 */
export interface AppErrorJson extends ErrorCoreMetadata {
  readonly message: string;
  readonly metadata: ErrorMetadata;
}

/**
 * Options for constructing an application error instance.
 */
export interface AppErrorOptions {
  readonly cause: unknown;
  readonly message: string;
  readonly metadata: ErrorMetadata;
}

export type UnexpectedErrorOptions = Omit<AppErrorOptions, "cause">;
