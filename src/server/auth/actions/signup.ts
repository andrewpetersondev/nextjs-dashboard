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
import { UserRepository } from "@/server/users/repo";
import { UsersService } from "@/server/users/service";
import { toUserId } from "@/shared/domain/id-converters";
import type { FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
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

  const service = new UsersService(new UserRepository(getDB()));
  const res = await service.signup(validated.data);

  if (!res.success) {
    return resultToFormState<SignupFormFieldNames, UserDto>(
      { error: res.error, success: false },
      { fields, raw: {} },
    );
  }

  await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  redirect(ROUTES.DASHBOARD.ROOT);
}
