/**
 * Loose shape matching a ZodError for flattening.
 */
export type ZodErrorLike = {
  readonly issues: readonly {
    readonly path: readonly (string | number | symbol)[];
    readonly message: string;
  }[];
};
