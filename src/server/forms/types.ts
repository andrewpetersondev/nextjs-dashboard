import "server-only";

// Core-only options: no messages/redaction/return mode
export type ValidateFormOptions<TIn, TOut = TIn> = {
  transform?: (data: TIn) => TOut | Promise<TOut>;
};
