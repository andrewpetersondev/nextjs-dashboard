// Purpose: thin login action using shared Result helpers and centralized auth→form mapping.
"use server";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { establishSession } from "@/server/auth/actions/establish-session";
import {
  mapAuthServiceErrorToFormResult,
  mapUnknownToAuthServiceError,
} from "@/server/auth/mappers/auth-service-errors.mappers";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { ROUTES } from "@/shared/routes/routes";

const LOGGER_CONTEXT = "login.action";
const fields = LOGIN_FIELDS_LIST;

// Replace the helper to only collect known fields and return a frozen record.
function pickFormDataFields(
  fd: FormData,
  allowed: readonly LoginField[],
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const k of allowed) {
    const v = fd.get(k);
    if (v !== null) {
      out[k] = typeof v === "string" ? v : String(v);
    }
  }
  return Object.freeze(out);
}

/**
 * Handles the login action by validating form data, authenticating the user,
 * setting up a session, and redirecting on success.
 *
 * @param _prevState - The previous state of the login form.
 * @param formData - The submitted form data containing login credentials.
 * @returns A promise that resolves to a {@link FormResult} representing the outcome.
 * @throws If an unexpected error occurs during session establishment or redirection.
 * @see UserAuthFlowService for authentication logic.
 */
export async function loginAction(
  _prevState: FormResult<LoginField, unknown>,
  formData: FormData,
): Promise<FormResult<LoginField, unknown>> {
  const raw = pickFormDataFields(formData, fields);
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
  const service = new UserAuthFlowService(getAppDb());

  const sessionResult = await flatMapAsync((i: LoginData) => service.login(i))(
    Ok(input),
  )
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSession));

  if (!sessionResult.ok) {
    const svcError = mapUnknownToAuthServiceError(sessionResult.error);
    return mapAuthServiceErrorToFormResult<LoginField, unknown>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  // 3) Redirect on success
  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<LoginField, unknown>({});
}
