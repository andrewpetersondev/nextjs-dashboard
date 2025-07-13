import {
  type LoginFormFieldNames,
  type LoginFormFields,
  LoginFormSchema,
  type SignupFormFieldNames,
  type SignupFormFields,
  SignupFormSchema,
} from "@/features/users/user.types";
import { USER_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { USER_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { FormState } from "@/lib/forms/form.types";
import { validateFormData } from "@/lib/forms/form-validation";

/**
 * Validates signup form data using the generic form validation utility.
 *
 * @param formData - The FormData object from the signup form.
 * @returns FormState<SignupFormFieldNames, SignupFormFields>
 */
export function validateSignupForm(
  formData: FormData,
): FormState<SignupFormFieldNames, SignupFormFields> {
  const result = validateFormData<SignupFormFields>(formData, SignupFormSchema);
  return {
    errors: result.errors as FormState<SignupFormFieldNames>["errors"], //Ensures correct error typing
    message: result.success
      ? USER_SUCCESS_MESSAGES.PARSE_SUCCESS
      : USER_ERROR_MESSAGES.VALIDATION_FAILED,
    success: result.success,
    ...(result.data ? { data: result.data } : {}), // Only include data on success
  };
}

/**
 * Validates login form data using the generic form validation utility.
 *
 * @param formData - The FormData object from the login form.
 * @returns FormState<LoginFormFieldNames, LoginFormFields>
 */
export const validateLoginForm = (
  formData: FormData,
): FormState<LoginFormFieldNames, LoginFormFields> => {
  const result = validateFormData<LoginFormFields>(formData, LoginFormSchema);
  return {
    errors: result.errors as FormState<LoginFormFieldNames>["errors"], //Ensures correct error typing
    message: result.success
      ? USER_SUCCESS_MESSAGES.PARSE_SUCCESS
      : USER_ERROR_MESSAGES.VALIDATION_FAILED,
    success: result.success,
    ...(result.data ? { data: result.data } : {}), // Only include data on success
  };
};
