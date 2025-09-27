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
import { UsersRepository } from "@/server/users/repo";
import { UsersService } from "@/server/users/service";
import { toUserId } from "@/shared/domain/id-converters";
import { createEmptyDenseErrorMap } from "@/shared/forms/error-mapping";
import type { DenseErrorMap, FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { ROUTES } from "@/shared/routes/routes";

function repoErrorToDense<TField extends SignupFormFieldNames>(
  e: { kind: "DatabaseError" | "CreateFailed"; message: string },
  fields: readonly TField[],
): DenseErrorMap<TField> {
  // Build a dense map with empty readonly arrays (typed safely)
  const empty = createEmptyDenseErrorMap(fields);
  // Attach the error message to the first field as a generic/root message
  const target = (fields[0] ?? ("username" as TField)) as TField;
  return { ...empty, [target]: [e.message] as const };
}

// Keep the returned state consistent and never throw before redirect.
export async function signup(
  _prev: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  const fields = SIGNUP_FIELDS;

  // Validate + normalize using generic helper (schema already trims/normalizes).
  const validated = await validateFormGeneric<
    SignupFormInput,
    SignupFormFieldNames
  >(formData, SignupFormSchema, fields, {
    fields, // explicit fields to keep consistent with UI
    loggerContext: "signup.validate",
    // No extra transform needed: schema already normalizes email/username and trims password.
  });

  // Early return on validation failure (includes dense field errors and redacted values)
  if (!validated.success) {
    return validated;
  }

  // Execute domain logic
  const service = new UsersService(new UsersRepository(getDB()));
  const res = await service.signup({
    email: validated.data.email,
    password: validated.data.password,
    username: validated.data.username,
  });

  // Map repository/service failure to a dense error map and consistent failure state
  if (!res.success) {
    const denseErrors = repoErrorToDense(res.error, fields);
    return resultToFormState<SignupFormFieldNames, UserDto>(
      { error: denseErrors, success: false },
      {
        fields,
        // values are derived from the original formData that validateFormGeneric used internally.
        // We don’t have raw here; echoing nothing keeps sensitive data safe. If needed,
        // pass an explicit raw via validateFormGeneric options and reuse it here.
        raw: {},
      },
    );
  }

  // Success: set session and redirect
  await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  redirect(ROUTES.DASHBOARD.ROOT);
}
