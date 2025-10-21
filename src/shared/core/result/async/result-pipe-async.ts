import type { ErrorLike } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";

/**
 * Type helper for a step function that transforms Result<TIn, TError> → Result<TOut, TError>.
 */
type PipeStep<TIn, TOut, TError extends ErrorLike> = (
  r: Result<TIn, TError>,
) => Result<TOut, TError> | Promise<Result<TOut, TError>>;

export async function pipeAsync<TError extends ErrorLike, T1, T2>(
  seed: Result<T1, TError>,
  step1: PipeStep<T1, T2, TError>,
): Promise<Result<T2, TError>>;

export async function pipeAsync<TError extends ErrorLike, T1, T2, T3>(
  seed: Result<T1, TError>,
  step1: PipeStep<T1, T2, TError>,
  step2: PipeStep<T2, T3, TError>,
): Promise<Result<T3, TError>>;

export async function pipeAsync<TError extends ErrorLike, T1, T2, T3, T4>(
  seed: Result<T1, TError>,
  step1: PipeStep<T1, T2, TError>,
  step2: PipeStep<T2, T3, TError>,
  step3: PipeStep<T3, T4, TError>,
): Promise<Result<T4, TError>>;

// biome-ignore lint/nursery/useMaxParams: <I want to keep it.>
export async function pipeAsync<TError extends ErrorLike, T1, T2, T3, T4, T5>(
  seed: Result<T1, TError>,
  step1: PipeStep<T1, T2, TError>,
  step2: PipeStep<T2, T3, TError>,
  step3: PipeStep<T3, T4, TError>,
  step4: PipeStep<T4, T5, TError>,
): Promise<Result<T5, TError>>;

// Implementation signature
// Implementation signature uses `any` for variadic rest parameters.
// This is standard TypeScript practice for function overloads with variadic arguments.
// Type safety is enforced by the overload signatures above, which are the only callable forms.
export async function pipeAsync<TError extends ErrorLike>(
  // biome-ignore lint/suspicious/noExplicitAny: <safe because of overloads>
  seed: Result<any, TError>,
  // biome-ignore lint/suspicious/noExplicitAny: <safe because of overloads>
  ...steps: readonly PipeStep<any, any, TError>[]
  // biome-ignore lint/suspicious/noExplicitAny: <safe because of overloads>
): Promise<Result<any, TError>> {
  // biome-ignore lint/suspicious/noExplicitAny: <safe because of overloads>
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
