// Shallow
export type Values<T> = T[keyof T];
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Deep immutability
export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

// Deep partial (opposite of DeepReadonly in spirit)
export type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

// Deep required (removes ? recursively)
export type DeepRequired<T> = {
  [K in keyof T]-?: DeepRequired<T[K]>;
};
