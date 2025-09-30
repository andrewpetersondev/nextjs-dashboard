"use server";

import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { UserAuthFlowService } from "@/server/users/auth-flow-service.user";
import { toUserId } from "@/shared/domain/id-converters";
import { attachRootDenseMessageToField } from "@/shared/forms/mapping/error-repo";
import { mapResultToFormState } from "@/shared/forms/state/result-to-form-state";
import type { FormState } from "@/shared/forms/types/form-state";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Server Action: login
 *
 * Validates login input, authenticates the user, starts a session, and redirects.
 *
 * @param _prevState - Previous form state (ignored by this action)
 * @param formData - FormData containing login fields
 * @returns FormState for UI; on success this action redirects
 */
export async function login(
  _prevState: FormState<LoginField, unknown>,
  formData: FormData,
): Promise<FormState<LoginField, unknown>> {
  const fields = LOGIN_FIELDS_LIST;

  const validated = await validateFormGeneric<LoginData, LoginField, LoginData>(
    formData,
    LoginSchema,
    fields,
    {
      fields,
      loggerContext: "login.validate",
    },
  );

  // If validation failed, return the FormState produced by validateFormGeneric
  if (!validated.success || !validated.data) {
    return validated;
  }

  try {
    // Use auth-flow service -> repo -> DAL pipeline
    const service = new UserAuthFlowService(getDB());
    const res = await service.authFlowLoginService(validated.data);

    if (!res.success || !res.data) {
      // Map domain/service error into dense field errors for consistent UI handling.
      const dense = attachRootDenseMessageToField(
        fields,
        "Login failed. Please try again.",
      );
      return mapResultToFormState<LoginField, unknown>(
        { error: dense, success: false },
        { fields, raw: {} },
      );
    }

    // Establish session only after successful login
    await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  } catch (err) {
    // Unexpected error path: log safely and return a consistent failure state.
    serverLogger.error({
      context: "login.persist",
      // do not include sensitive data; structure the log minimally
      error:
        // TODO: Other layers should return more specific errors so create strategy that is more specific
        err instanceof Error
          ? { message: err.message, name: err.name }
          : { message: "Unknown error" },
      message: "Unexpected error during login",
    });

    const dense = attachRootDenseMessageToField(
      fields,
      "Unexpected error. Please try again.",
    );
    return mapResultToFormState<LoginField, unknown>(
      { error: dense, success: false },
      { fields, raw: {} },
    );
  }

  // Redirect on success; never return a value after redirect.
  redirect(ROUTES.DASHBOARD.ROOT);
}
