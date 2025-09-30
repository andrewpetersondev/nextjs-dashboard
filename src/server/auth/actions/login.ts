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
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import { attachRootDenseMessageToField } from "@/shared/forms/errors/error-map-helpers";
import { mapResultToFormState } from "@/shared/forms/mapping/result-to-form-state.mapping";
import type { FormState } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Login Server Action
 * Validates, authenticates user, starts session, then redirects.
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
    { fields, loggerContext: "login.validate" },
  );

  // If validation failed, return the FormState produced by validateFormGeneric
  if (!validated.success || !validated.data) {
    return validated;
  }

  try {
    // Use auth-flow service -> repo -> DAL pipeline
    const service = new UserAuthFlowService(getDB());
    const res = await service.login(validated.data);

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
      context: "login.action",
      error:
        err instanceof Error
          ? { message: err.message, name: err.name }
          : { message: "Unknown error" },
      message: "Unexpected error during login action",
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
