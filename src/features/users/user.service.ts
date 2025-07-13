import type { SignupFormFieldNames } from "@/features/users/user.types";
import { SignupFormSchema } from "@/features/users/user.types";
import { USER_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { USER_SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { FormState } from "@/lib/definitions/form.types";
import { actionResult, normalizeFieldErrors } from "@/lib/utils/utils.server";

export function validateSignupForm(
  formData: FormData,
): FormState<SignupFormFieldNames> {
  const parsed = SignupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    // Return normalized field errors and a failure message
    return actionResult({
      errors: normalizeFieldErrors(parsed.error.flatten().fieldErrors),
      message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
      success: false,
    });
  }

  // Return validated data and success
  return actionResult({
    data: parsed.data,
    message: USER_SUCCESS_MESSAGES.PARSE_SUCCESS,
    success: true,
  });
}
