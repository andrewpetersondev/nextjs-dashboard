/**
 * File: src/server/auth/actions/signup.action.ts
 * Purpose: thin signup action using shared Result helpers and centralized auth→form mapping.
 */
"use server";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
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
import { Ok } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import { toFormValidationErr } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

const LOGGER_CONTEXT = "signup.action";
const fields = SIGNUP_FIELDS_LIST;

// add local adapters to keep action-layer error type stable
function isAuthServiceError(e: unknown): e is AuthServiceError {
  return typeof e === "object" && e !== null && "kind" in e && "message" in e;
}

function toAuthServiceError(e: unknown): AuthServiceError {
  if (isAuthServiceError(e)) {
    return e;
  }
  return {
    kind: "unexpected",
    message: e instanceof Error ? e.message : String(e),
  } as const;
}

// Replace the helper to only collect known fields and return a frozen record.
function pickFormDataFields(
  fd: FormData,
  allowed: readonly SignupField[],
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
 * Handles the signup process by validating the input, interacting with the user service,
 * and establishing a session upon success.
 */
export async function signupAction(
  _prevState: FormResult<SignupField, unknown>,
  formData: FormData,
): Promise<FormResult<SignupField, unknown>> {
  const raw = pickFormDataFields(formData, fields);
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
  const service = new UserAuthFlowService(getAppDb());

  // remove explicit Result<true, AuthServiceError> to allow inference from chain
  const sessionResult = await flatMapAsync((i: SignupData) =>
    service.signup(i),
  )(Ok(input))
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSession));

  if (!sessionResult.ok) {
    return authErrorToFormResult<SignupField>(
      fields,
      toAuthServiceError(sessionResult.error),
      raw,
    );
  }

  redirect(ROUTES.DASHBOARD.ROOT);
}
