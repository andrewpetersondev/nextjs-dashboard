import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

/**
 * Success payload shape for forms.
 */
export interface FormSuccess<Tpayload> {
  readonly data: Tpayload;
  readonly message: string;
}

/**
 * Unified Result type for forms - uses standard Result<T, AppError>.
 */
export type FormResult<Tpayload> = Result<FormSuccess<Tpayload>, AppError>;
