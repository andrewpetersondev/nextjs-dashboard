/** biome-ignore-all lint/suspicious/noExplicitAny: <safe because of overloads> */
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";

/**
 * Type helper for a step function that transforms Result<TIn, TErrorIn> → Result<TOut, TErrorOut>.
 * Each step can introduce new error types, which get unioned together.
 */
type PipeStep<
  TIn,
  TOut,
  TErrorIn extends AppError,
  TErrorOut extends AppError,
> = (
  r: Result<TIn, TErrorIn>,
) => Result<TOut, TErrorOut> | Promise<Result<TOut, TErrorOut>>;

export async function pipeAsync<
  TError1 extends AppError,
  TError2 extends AppError,
  T1,
  T2,
>(
  seed: Result<T1, TError1>,
  step1: PipeStep<T1, T2, TError1, TError2>,
): Promise<Result<T2, TError1 | TError2>>;

export async function pipeAsync<
  TError1 extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  T1,
  T2,
  T3,
>(
  seed: Result<T1, TError1>,
  step1: PipeStep<T1, T2, TError1, TError2>,
  step2: PipeStep<T2, T3, TError1 | TError2, TError3>,
): Promise<Result<T3, TError1 | TError2 | TError3>>;

export async function pipeAsync<
  TError1 extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  TError4 extends AppError,
  T1,
  T2,
  T3,
  T4,
>(
  seed: Result<T1, TError1>,
  step1: PipeStep<T1, T2, TError1, TError2>,
  step2: PipeStep<T2, T3, TError1 | TError2, TError3>,
  step3: PipeStep<T3, T4, TError1 | TError2 | TError3, TError4>,
): Promise<Result<T4, TError1 | TError2 | TError3 | TError4>>;

export async function pipeAsync<
  TError1 extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  TError4 extends AppError,
  TError5 extends AppError,
  T1,
  T2,
  T3,
  T4,
  T5,
  // biome-ignore lint/nursery/useMaxParams: <explanation>
>(
  seed: Result<T1, TError1>,
  step1: PipeStep<T1, T2, TError1, TError2>,
  step2: PipeStep<T2, T3, TError1 | TError2, TError3>,
  step3: PipeStep<T3, T4, TError1 | TError2 | TError3, TError4>,
  step4: PipeStep<T4, T5, TError1 | TError2 | TError3 | TError4, TError5>,
): Promise<Result<T5, TError1 | TError2 | TError3 | TError4 | TError5>>;

export async function pipeAsync<TError extends AppError>(
  seed: Result<any, TError>,
  ...steps: readonly PipeStep<any, any, any, any>[]
): Promise<Result<any, TError>> {
  let current: Result<any, TError> = seed;

  for (const step of steps) {
    if (!current.ok) {
      break;
    }
    // biome-ignore lint/performance/noAwaitInLoops: <temporary>
    current = await step(current);
  }

  return current;
}
