"use server";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { establishSessionAction } from "@/server/auth/application/actions/establish-session.action";
import { mapAuthServiceErrorToFormResult } from "@/server/auth/application/mapping/auth-error.to-form-result.mapper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { toUnexpectedAuthError } from "@/server/auth/domain/errors/auth-error.factories";
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

  /**
   * Login pipeline (Result-based, curried).
   *
   * Compose: Ok(input) → login → pick session payload → establish session
   *
   * Flow:
   * 1) Seed: Ok(input) — wrap validated LoginData into a Result to drive the chain.
   * 2) flatMapAsync((i) => service.login(i)) — if Ok, call login(i) and adopt its Result; if Err, short‑circuit.
   * 3) .then(mapOk(user => ({ id: user.id, role: user.role }))) — on Ok, project the user to the session payload; Err passes through.
   * 4) .then(flatMapAsync(establishSessionAction)) — if Ok, create the session and adopt its Result; otherwise short‑circuit.
   *
   * Notes:
   * - “Curried” here means flatMapAsync(fn) returns a function expecting a Result; we immediately invoke it with Ok(input).
   * - Errors are preserved across steps; the first Err stops further work.
   */
  const sessionResult = await flatMapAsync(service.login.bind(service))(
    Ok(input),
  )
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSessionAction));

  if (!sessionResult.ok) {
    const svcError = toUnexpectedAuthError(sessionResult.error);
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
