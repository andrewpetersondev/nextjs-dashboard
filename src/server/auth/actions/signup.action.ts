/**
 * File: src/server/auth/actions/signup.action.ts
 * Purpose: thin signup action using shared Result helpers and centralized auth→form mapping.
 */

"use server";

import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { establishSession } from "@/server/auth/actions/establish-session";
import {
  type AuthServiceError,
  UserAuthFlowService,
} from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { authErrorToFormResult } from "@/server/forms/auth-error-to-form-result.mapper";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok, type Result } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

const LOGGER_CONTEXT = "signup.action";

/**
 * Handles the signup process by validating the input, interacting with the user service,
 * and establishing a session upon success.
 */
export async function signupAction(
  _prevState: FormResult<SignupField, unknown>,
  formData: FormData,
): Promise<FormResult<SignupField, unknown>> {
  const fields = SIGNUP_FIELDS_LIST;
  const rawEntries = Object.fromEntries(formData.entries());
  const raw = Object.fromEntries(
    Object.entries(rawEntries).map(([k, v]) => [
      k,
      typeof v === "string" ? v : String(v),
    ]),
  ) as Readonly<Record<string, string>>;

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

  const input = validated.value.data;

  const service = new UserAuthFlowService(getAppDb());

  const sessionResult: Result<true, AuthServiceError> = await flatMapAsync<
    typeof input,
    { id: string; role: string },
    AuthServiceError,
    AuthServiceError
  >(async (i) => service.signup(i))(Ok<typeof input, never>(input))
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSession));

  if (!sessionResult.ok) {
    return authErrorToFormResult<SignupField>(fields, sessionResult.error, raw);
  }

  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<SignupField, unknown>({});
}
