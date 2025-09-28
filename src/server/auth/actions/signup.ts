"use server";

import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS,
  type SignupFormFieldNames,
  type SignupFormInput,
  SignupFormSchema,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { UserAuthFlowService } from "@/server/users/auth-flow-service.user";
import { toUserId } from "@/shared/domain/id-converters";
import { mapResultToFormState } from "@/shared/forms/state/result-to-form-state";
import type { FormState } from "@/shared/forms/types/form-state";
import { ROUTES } from "@/shared/routes/routes";

// Keep the returned state consistent and never throw before redirect.
export async function signup(
  _prev: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  const fields = SIGNUP_FIELDS;

  // Validate using schema-only transforms; no extra transform function.
  const validated = await validateFormGeneric<
    SignupFormInput,
    SignupFormFieldNames
  >(formData, SignupFormSchema, fields, {
    fields,
    loggerContext: "signup.validate",
  });

  if (!validated.success) {
    return validated;
  }

  // Use auth-flow service -> repo -> DAL pipeline
  const service = new UserAuthFlowService(getDB());
  const res = await service.authFlowSignupService(validated.data);

  if (!res.success) {
    return mapResultToFormState<SignupFormFieldNames, UserDto>(
      { error: res.error, success: false },
      { fields, raw: {} },
    );
  }

  await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  redirect(ROUTES.DASHBOARD.ROOT);
}
