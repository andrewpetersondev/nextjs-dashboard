import type { BaseError } from "@/shared/errors/base-error";
import type { Result } from "@/shared/result/result";

/**
 * Success payload shape for forms.
 */
export interface FormSuccess<Tpayload> {
  readonly data: Tpayload;
  readonly message: string;
}

/**
 * Unified Result type for forms - uses standard Result<T, BaseError>.
 */
export type FormResult<Tpayload> = Result<FormSuccess<Tpayload>, BaseError>;
