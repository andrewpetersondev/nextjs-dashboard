"use server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
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

const LOGGER_CONTEXT = "login.action";
const fields = LOGIN_FIELDS_LIST;

const toSessionUser = mapOk((user: { id: UserId; role: UserRole }) => ({
  id: user.id,
  role: user.role,
}));

/**
 * Handles the login action by validating form data, authenticating the user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Validate form → if invalid, return FormResult with field errors.
 * - Authenticate → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
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

  // Login pipeline (Result-based, extracted steps).
  // Compose: Ok(input) → authenticate → toSessionUser → establishSession

  const seed = Ok(input);
  const authenticate = flatMapAsync(service.login.bind(service));
  const establishSession = flatMapAsync(establishSessionAction);

  const sessionResult = await authenticate(seed)
    .then(toSessionUser)
    .then(establishSession);

  if (!sessionResult.ok) {
    const svcError = toUnexpectedAppError(sessionResult.error);
    return appErrorToFormResult<LoginField, unknown>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<LoginField, unknown>({});
}
