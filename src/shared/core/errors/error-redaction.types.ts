export interface InternalConfig {
  readonly mask: string;
  readonly maxDepth: number;
  readonly partialMask: boolean;
  readonly sensitive: Set<string>;
}

export interface ArrayRedactOptions {
  arr: unknown[];
  depth: number;
  cfg: InternalConfig;
  seen: WeakSet<object>;
  walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

export interface ObjectRedactOptions {
  obj: Record<string, unknown>;
  depth: number;
  cfg: InternalConfig;
  seen: WeakSet<object>;
  walker: (value: unknown, depth: number, keyHint?: string) => unknown;
}

export interface RedactOptions {
  readonly extraKeys?: readonly string[];
  readonly mask?: string;
  readonly maxDepth?: number;
  readonly partialMask?: boolean;
}
