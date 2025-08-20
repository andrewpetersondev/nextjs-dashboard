import "server-only";

import type * as z from "zod";
import {
  LoginFormSchema,
  SignupFormSchema,
} from "@/features/users/user.schema";
import type {
  LoginFormFieldNames,
  LoginFormFields,
  SignupFormFieldNames,
  SignupFormFields,
} from "@/features/users/user.types";
import { validateFormData } from "@/server/forms/form.validation";
import type { FormState } from "@/shared/forms/form.types";

/**
 * Generic form validation function that can handle different types of forms.
 *
 * @template TFieldNames - String literal union of valid form field names
 * @template TData - Type of the validated form data
 * @param formData - The FormData object from the form
 * @param schema - The Zod schema to validate against
 * @param fields - Array of field names to validate
 * @returns FormState<TFieldNames, TData>
 */
export function validateForm<TFieldNames extends string, TData>(
  formData: FormData,
  schema: z.ZodSchema<TData>,
  fields: readonly TFieldNames[],
): FormState<TFieldNames, TData> {
  return validateFormData(formData, schema, fields);
}

/**
 * Validates signup form data using the generic form validation utility.
 *
 * @param formData - The FormData object from the signup form.
 * @returns FormState<SignupFormFieldNames, SignupFormFields>
 * @remarks
 * This function is ridiculously stupid. Am I wrong?
 */
export function validateSignupForm(
  formData: FormData,
): FormState<SignupFormFieldNames, SignupFormFields> {
  return validateForm(formData, SignupFormSchema, [
    "username",
    "email",
    "password",
  ]);
}

/**
 * Validates login form data using the generic form validation utility.
 *
 * @param formData - The FormData object from the login form.
 * @returns FormState<LoginFormFieldNames, LoginFormFields>
 * @remarks
 * This function is ridiculously stupid. Am I wrong?
 */
export const validateLoginForm = (
  formData: FormData,
): FormState<LoginFormFieldNames, LoginFormFields> => {
  return validateForm(formData, LoginFormSchema, ["email", "password"]);
};
