import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Step function transforming Result<TValue, TError> → Result<TNextValue, TNextError>.
 */
type PipeStep<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
> = (
  r: Result<TValue, TError>,
) => Result<TNextValue, TNextError> | Promise<Result<TNextValue, TNextError>>;

export async function pipeAsync<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TNextValue, TError, TNextError>,
): Promise<Result<TNextValue, TError | TNextError>>;

export async function pipeAsync<
  TValue,
  TValue2,
  TValue3,
  TError extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TValue2, TError, TError2>,
  step2: PipeStep<TValue2, TValue3, TError | TError2, TError3>,
): Promise<Result<TValue3, TError | TError2 | TError3>>;

export async function pipeAsync<
  TValue,
  TValue2,
  TValue3,
  TValue4,
  TError extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  TError4 extends AppError,
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TValue2, TError, TError2>,
  step2: PipeStep<TValue2, TValue3, TError | TError2, TError3>,
  step3: PipeStep<TValue3, TValue4, TError | TError2 | TError3, TError4>,
): Promise<Result<TValue4, TError | TError2 | TError3 | TError4>>;

export async function pipeAsync<
  TValue,
  TValue2,
  TValue3,
  TValue4,
  TValue5,
  TError extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  TError4 extends AppError,
  TError5 extends AppError,
  // biome-ignore lint/nursery/useMaxParams: <multistep pipe requires more params>
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TValue2, TError, TError2>,
  step2: PipeStep<TValue2, TValue3, TError | TError2, TError3>,
  step3: PipeStep<TValue3, TValue4, TError | TError2 | TError3, TError4>,
  step4: PipeStep<
    TValue4,
    TValue5,
    TError | TError2 | TError3 | TError4,
    TError5
  >,
): Promise<Result<TValue5, TError | TError2 | TError3 | TError4 | TError5>>;

export async function pipeAsync<E extends AppError>(
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
  seed: Result<any, E>,
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
  ...steps: readonly PipeStep<any, any, any, any>[]
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
): Promise<Result<any, E>> {
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
  let current: Result<any, E> = seed;

  for (const step of steps) {
    if (!current.ok) {
      break;
    }
    try {
      // biome-ignore lint/performance/noAwaitInLoops: sequential execution is intended
      current = await step(current);
    } catch (e) {
      // If a step throws or rejects instead of returning a Result,
      // we treat it as an unhandled error.
      // Note: In a production app, we'd ideally use a proper error factory here.
      // biome-ignore lint/complexity/noUselessCatch: keep for now
      throw e;
    }
  }

  return current;
}
