export type DalIdentifiers = Record<string, number | string>;

export interface ExecuteDalCoreOptions {
  readonly operationContext: string;
}

export interface DalContextLite {
  readonly identifiers: DalIdentifiers;
  readonly operation: string;
  readonly entity: string;
}
