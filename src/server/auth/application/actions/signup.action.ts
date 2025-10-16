"use server";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { establishSessionAction } from "@/server/auth/application/actions/establish-session.action";
import { createUserAuthService } from "@/server/auth/application/services/user-auth.service.factory";
import {
  mapAuthServiceErrorToFormResult,
  mapUnknownToAuthServiceError,
} from "@/server/auth/domain/mappers/auth-service-errors.mapper";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import { pickFormDataFields } from "@/shared/forms/fields/formdata.extractor";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { ROUTES } from "@/shared/routes/routes";

const LOGGER_CONTEXT = "signup.action";
const fields = SIGNUP_FIELDS_LIST;

/**
 * Handles the signup process by validating the input, interacting with the user service,
 * and establishing a session upon success.
 */
export async function signupAction(
  _prevState: FormResult<SignupField, unknown>,
  formData: FormData,
): Promise<FormResult<SignupField, unknown>> {
  const raw = pickFormDataFields<SignupField>(formData, fields);
  const validated = await validateFormGeneric(formData, SignupSchema, fields, {
    loggerContext: LOGGER_CONTEXT,
  });

  if (!validated.ok) {
    return toFormValidationErr<SignupField, unknown>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw,
    });
  }

  const input: SignupData = validated.value.data;
  const service = createUserAuthService(getAppDb());

  const sessionResult = await flatMapAsync((i: SignupData) =>
    service.signup(i),
  )(Ok(input))
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSessionAction));

  if (!sessionResult.ok) {
    const svcError = mapUnknownToAuthServiceError(sessionResult.error);
    return mapAuthServiceErrorToFormResult<SignupField, unknown>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<SignupField, unknown>({});
}
