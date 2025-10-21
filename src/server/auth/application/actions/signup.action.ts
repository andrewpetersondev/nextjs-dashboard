"use server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { establishSessionAction } from "@/server/auth/application/actions/establish-session.action";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { toUnexpectedAppError } from "@/server/auth/domain/errors/app-error.factories";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import type { UserId } from "@/shared/domain/domain-brands";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import { pickFormDataFields } from "@/shared/forms/fields/formdata.extractor";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { ROUTES } from "@/shared/routes/routes";

const LOGGER_CONTEXT = "signup.action";
const fields = SIGNUP_FIELDS_LIST;

const toSessionUser = mapOk((user: { id: UserId; role: UserRole }) => ({
  id: user.id,
  role: user.role,
}));

/**
 * Handles the signup action by validating form data, creating the user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Validate form → if invalid, return FormResult with field errors.
 * - Signup → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
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
  const service = createAuthUserService(getAppDb());

  // Signup pipeline (Result-based, extracted steps).
  // Compose: Ok(input) → signup → toSessionUser → establishSession

  const seed = Ok(input);
  const signup = flatMapAsync(service.signup.bind(service));
  const establishSession = flatMapAsync(establishSessionAction);

  const sessionResult = await signup(seed)
    .then(toSessionUser)
    .then(establishSession);

  if (!sessionResult.ok) {
    const svcError = toUnexpectedAppError(sessionResult.error);
    return appErrorToFormResult<SignupField, unknown>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<SignupField, unknown>({});
}
