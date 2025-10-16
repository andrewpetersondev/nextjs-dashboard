"use server";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { establishSessionAction } from "@/server/auth/application/actions/establish-session.action";
import {
  mapAuthServiceErrorToFormResult,
  mapUnknownToAuthServiceError,
} from "@/server/auth/application/mappers/auth-service-errors.mapper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
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

const LOGGER_CONTEXT = "login.action";
const fields = LOGIN_FIELDS_LIST;

/**
 * Handles the login action by validating form data, authenticating the user,
 * setting up a session, and redirecting on success.
 *
 * @param _prevState - The previous state of the login form.
 * @param formData - The submitted form data containing login credentials.
 * @returns A promise that resolves to a {@link FormResult} representing the outcome.
 * @throws If an unexpected error occurs during session establishment or redirection.
 * @see UserAuthService for authentication logic.
 */
export async function loginAction(
  _prevState: FormResult<LoginField, unknown>,
  formData: FormData,
): Promise<FormResult<LoginField, unknown>> {
  const raw = pickFormDataFields<LoginField>(formData, fields);
  const validated = await validateFormGeneric(formData, LoginSchema, fields, {
    loggerContext: LOGGER_CONTEXT,
  });

  if (!validated.ok) {
    return toFormValidationErr<LoginField, unknown>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw,
    });
  }

  const input: LoginData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const sessionResult = await flatMapAsync((i: LoginData) => service.login(i))(
    Ok(input),
  )
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSessionAction));

  if (!sessionResult.ok) {
    const svcError = mapUnknownToAuthServiceError(sessionResult.error);
    return mapAuthServiceErrorToFormResult<LoginField, unknown>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<LoginField, unknown>({});
}
