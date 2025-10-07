// Purpose: thin login action using shared Result helpers and centralized auth→form mapping.
"use server";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { authErrorToFormResult } from "@/server/forms/auth-error-to-form-result.mapper";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
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
const LOGGER_CONTEXT_SESSION = "login.action.session";

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
  const fields = LOGIN_FIELDS_LIST;
  const raw = Object.fromEntries(formData.entries());

  // 1) Validate input
  const validated = await validateFormGeneric(formData, LoginSchema, fields);

  if (!validated.ok) {
    return toFormValidationErr<LoginField, unknown>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw,
    });
  }

  const input = validated.value.data;

  // 2) Service login + session using Result helpers
  const service = new UserAuthFlowService(getAppDb());

  const sessionResult: Result<
    true,
    Parameters<typeof authErrorToFormResult>[1]
  > = await flatMapAsync<
    typeof input,
    { id: string; role: string },
    Parameters<typeof authErrorToFormResult>[1],
    Parameters<typeof authErrorToFormResult>[1]
  >(async (i) => service.login(i))(Ok<typeof input, never>(input))
    .then(mapOk((user) => ({ id: user.id, role: user.role })))
    .then(
      flatMapAsync(async (u) => {
        try {
          await setSessionToken(toUserId(u.id), toUserRole(u.role));
          return Ok<true, never>(true);
        } catch (err) {
          serverLogger.error({
            context: LOGGER_CONTEXT_SESSION,
            error:
              err instanceof Error
                ? { message: err.message, name: err.name }
                : { message: "Unknown error" },
            message: "Failed to establish session",
          });
          return Err<true, Parameters<typeof authErrorToFormResult>[1]>({
            kind: "unexpected",
            message: "Unexpected error",
          });
        }
      }),
    );

  if (!sessionResult.ok) {
    return authErrorToFormResult<LoginField>(fields, sessionResult.error, raw);
  }

  // 3) Redirect on success
  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<LoginField, unknown>({});
}
