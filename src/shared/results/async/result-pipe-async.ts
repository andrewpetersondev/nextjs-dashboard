/** biome-ignore-all lint/suspicious/noExplicitAny: <safe because of overloads> */

import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Step function transforming Result<Ti, Ei> → Result<To, Eo>.
 */
type PipeStep<Ti, To, Ei extends AppError, Eo extends AppError> = (
  r: Result<Ti, Ei>,
) => Result<To, Eo> | Promise<Result<To, Eo>>;

export async function pipeAsync<E extends AppError, E2 extends AppError, T, T2>(
  seed: Result<T, E>,
  step1: PipeStep<T, T2, E, E2>,
): Promise<Result<T2, E | E2>>;

export async function pipeAsync<
  E extends AppError,
  E2 extends AppError,
  E3 extends AppError,
  T,
  T2,
  T3,
>(
  seed: Result<T, E>,
  step1: PipeStep<T, T2, E, E2>,
  step2: PipeStep<T2, T3, E | E2, E3>,
): Promise<Result<T3, E | E2 | E3>>;

export async function pipeAsync<
  E extends AppError,
  E2 extends AppError,
  E3 extends AppError,
  E4 extends AppError,
  T,
  T2,
  T3,
  T4,
>(
  seed: Result<T, E>,
  step1: PipeStep<T, T2, E, E2>,
  step2: PipeStep<T2, T3, E | E2, E3>,
  step3: PipeStep<T3, T4, E | E2 | E3, E4>,
): Promise<Result<T4, E | E2 | E3 | E4>>;

export async function pipeAsync<
  E extends AppError,
  E2 extends AppError,
  E3 extends AppError,
  E4 extends AppError,
  E5 extends AppError,
  T,
  T2,
  T3,
  T4,
  T5,
  // biome-ignore lint/nursery/useMaxParams: <multistep pipe requires more params>
>(
  seed: Result<T, E>,
  step1: PipeStep<T, T2, E, E2>,
  step2: PipeStep<T2, T3, E | E2, E3>,
  step3: PipeStep<T3, T4, E | E2 | E3, E4>,
  step4: PipeStep<T4, T5, E | E2 | E3 | E4, E5>,
): Promise<Result<T5, E | E2 | E3 | E4 | E5>>;

export async function pipeAsync<E extends AppError>(
  seed: Result<any, E>,
  ...steps: readonly PipeStep<any, any, any, any>[]
): Promise<Result<any, E>> {
  let current: Result<any, E> = seed;

  for (const step of steps) {
    if (!current.ok) {
      break;
    }
    // biome-ignore lint/performance/noAwaitInLoops: <temporary>
    current = await step(current);
  }

  return current;
}
