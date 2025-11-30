import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result";

/**
 * Success payload shape for forms.
 */
export interface FormSuccess<T> {
  readonly data: T;
  readonly message: string;
}

/**
 * Unified Result type for forms - uses standard Result<T, AppError>.
 */
export type FormResult<T> = Result<FormSuccess<T>, AppError>;
