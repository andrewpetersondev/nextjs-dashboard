// Purpose: thin signup action using shared Result helpers and centralized auth→form mapping.
"use server";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import {
  type AuthServiceError,
  UserAuthFlowService,
} from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { authErrorToFormResult } from "@/server/forms/auth-error-to-form-result.mapper";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import { toUserId } from "@/shared/domain/id-converters";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

// --- Constants ---
const LOGGER_CONTEXT = "signup.action";
const LOGGER_CONTEXT_SESSION = "signup.action.session";

type SessionResultError = AuthServiceError;

// Map AppError -> AuthServiceError to keep error type consistent with service layer
const mapAppToAuthError = (e: {
  readonly message: string;
}): SessionResultError => ({
  kind: "unexpected",
  message: e.message || "Unexpected error",
});

// Use tryCatchAsync and return a concrete Result<true, AuthServiceError>
// this is essentially a side-effect service so it may be better to locate in /server/auth/session.service.ts
async function establishSession(u: {
  readonly id: string;
  readonly role: string;
}): Promise<Result<true, SessionResultError>> {
  const r = await tryCatchAsync(async () => {
    await setSessionToken(toUserId(u.id), toUserRole(u.role));
    return true as const;
  });

  // Map the ambiguous Result<unknown, AppError> from tryCatchAsync to Result<true, AuthServiceError>
  const mapped: Result<true, SessionResultError> = r.ok
    ? Ok<true, SessionResultError>(true as const)
    : Err<never, SessionResultError>(
        mapAppToAuthError(r.error as { readonly message: string }),
      );

  if (!mapped.ok) {
    serverLogger.error({
      context: LOGGER_CONTEXT_SESSION,
      error: { message: mapped.error.message, name: "AuthSessionError" },
      message: "Failed to establish session",
    });
  }
  return mapped;
}

/**
 * Handles the user signup process by validating input, calling the signup service, and managing session tokens.
 *
 * @param _prevState - The result of the previous signup attempt, used for state tracking on the client.
 * @param formData - The form data submitted by the user for signup.
 * @returns A promise resolving to `SignupFormResult`, indicating success or failure with any associated errors.
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

  // 1) Validate input → Result<FormSuccess<{ email; password; username }>, ValidationError>
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

  // 2) Service signup and compose with session setup using Result helpers
  const service = new UserAuthFlowService(getAppDb());

  const sessionResult: Result<true, SessionResultError> = await flatMapAsync<
    typeof input,
    { id: string; role: string },
    SessionResultError,
    SessionResultError
  >(async (i) => service.signup(i))(Ok<typeof input, never>(input))
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(flatMapAsync(establishSession));

  if (!sessionResult.ok) {
    return authErrorToFormResult<SignupField>(fields, sessionResult.error, raw);
  }

  // 3) Redirect on success
  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<SignupField, unknown>({});
}
