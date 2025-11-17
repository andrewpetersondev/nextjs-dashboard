import type { BaseError } from "@/shared/errors/base-error";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/form-result.types";
import type { Result } from "@/shared/result/result";

/**
 * Narrow to success branch.
 */
export const isFormOk = <Tpayload>(
  r: FormResult<Tpayload>,
): r is Result<FormSuccess<Tpayload>, never> => r.ok;

/**
 * Narrow to validation error branch.
 */
export const isFormErr = <Tpayload>(
  r: FormResult<Tpayload>,
): r is Result<never, BaseError> => !r.ok;

/**
 * Type guard to check if an BaseError contains form validation details.
 */
export const isFormValidationError = (error: BaseError): boolean =>
  error.code === "validation" && error?.fieldErrors !== undefined;
