export type DalIdentifiers = Record<string, number | string>;

export interface ExecuteDalCoreOptions {
  readonly operationContext: string;
}

export interface DalContextLite {
  readonly identifiers: DalIdentifiers;
  readonly operation: string;
  readonly entity: string;
}

/**
 * Builds the standard DAL error metadata shape to attach to AppError.metadata.
 *
 * @remarks
 * Keeps metadata keys consistent across executeDalResult / executeDalThrow and
 * callers that inspect DB-related failures.
 */
export function buildDalErrorMetadata(
  context: DalContextLite,
  options: ExecuteDalCoreOptions,
): Readonly<Record<string, unknown>> {
  return {
    entity: context.entity,
    identifiers: context.identifiers,
    operation: context.operation,
    operationContext: options.operationContext,
  };
}
