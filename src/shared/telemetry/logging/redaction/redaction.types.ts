export interface InternalConfig {
  readonly mask: string;
  readonly maxDepth: number;
  readonly partialMask: boolean;
  readonly sensitive: Set<string>;
}

export interface ArrayRedactOptions {
  arr: unknown[];
  cfg: InternalConfig;
  depth: number;
  seen: WeakSet<object>;
  walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

export interface ObjectRedactOptions {
  cfg: InternalConfig;
  depth: number;
  obj: Record<string, unknown>;
  seen: WeakSet<object>;
  walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

export interface RedactOptions {
  readonly extraKeys: readonly string[];
  readonly mask: string;
  readonly maxDepth: number;
  readonly partialMask: boolean;
}
