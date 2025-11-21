/** biome-ignore-all lint/suspicious/noExplicitAny: <safe because of overloads> */
import type { BaseError } from "@/shared/errors/core/base-error";
import type { Result } from "@/shared/result/result";

/**
 * Type helper for a step function that transforms Result<Tin, Terrorin> → Result<Tout, Terrorout>.
 * Each step can introduce new error types, which get unioned together.
 */
type PipeStep<
  Tin,
  Tout,
  Terrorin extends BaseError,
  Terrorout extends BaseError,
> = (
  r: Result<Tin, Terrorin>,
) => Result<Tout, Terrorout> | Promise<Result<Tout, Terrorout>>;

export async function pipeAsync<
  Terror1 extends BaseError,
  Terror2 extends BaseError,
  T1,
  T2,
>(
  seed: Result<T1, Terror1>,
  step1: PipeStep<T1, T2, Terror1, Terror2>,
): Promise<Result<T2, Terror1 | Terror2>>;

export async function pipeAsync<
  Terror1 extends BaseError,
  Terror2 extends BaseError,
  Terror3 extends BaseError,
  T1,
  T2,
  T3,
>(
  seed: Result<T1, Terror1>,
  step1: PipeStep<T1, T2, Terror1, Terror2>,
  step2: PipeStep<T2, T3, Terror1 | Terror2, Terror3>,
): Promise<Result<T3, Terror1 | Terror2 | Terror3>>;

export async function pipeAsync<
  Terror1 extends BaseError,
  Terror2 extends BaseError,
  Terror3 extends BaseError,
  Terror4 extends BaseError,
  T1,
  T2,
  T3,
  T4,
>(
  seed: Result<T1, Terror1>,
  step1: PipeStep<T1, T2, Terror1, Terror2>,
  step2: PipeStep<T2, T3, Terror1 | Terror2, Terror3>,
  step3: PipeStep<T3, T4, Terror1 | Terror2 | Terror3, Terror4>,
): Promise<Result<T4, Terror1 | Terror2 | Terror3 | Terror4>>;

export async function pipeAsync<
  Terror1 extends BaseError,
  Terror2 extends BaseError,
  Terror3 extends BaseError,
  Terror4 extends BaseError,
  Terror5 extends BaseError,
  T1,
  T2,
  T3,
  T4,
  T5,
  // biome-ignore lint/nursery/useMaxParams: <multistep pipe requires more params>
>(
  seed: Result<T1, Terror1>,
  step1: PipeStep<T1, T2, Terror1, Terror2>,
  step2: PipeStep<T2, T3, Terror1 | Terror2, Terror3>,
  step3: PipeStep<T3, T4, Terror1 | Terror2 | Terror3, Terror4>,
  step4: PipeStep<T4, T5, Terror1 | Terror2 | Terror3 | Terror4, Terror5>,
): Promise<Result<T5, Terror1 | Terror2 | Terror3 | Terror4 | Terror5>>;

export async function pipeAsync<Terror extends BaseError>(
  seed: Result<any, Terror>,
  ...steps: readonly PipeStep<any, any, any, any>[]
): Promise<Result<any, Terror>> {
  let current: Result<any, Terror> = seed;

  for (const step of steps) {
    if (!current.ok) {
      break;
    }
    // biome-ignore lint/performance/noAwaitInLoops: <temporary>
    current = await step(current);
  }

  return current;
}
