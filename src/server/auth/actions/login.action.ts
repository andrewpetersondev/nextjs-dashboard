// Purpose: slim, layered login action using Result and form helpers consistently.
"use server";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { asPasswordRaw } from "@/server/auth/types/password.types";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import { setSingleFieldErrorMessage } from "@/shared/forms/errors/dense-error-map.setters";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function loginAction(
  _prevState: FormResult<LoginField, unknown>,
  formData: FormData,
): Promise<FormResult<LoginField, unknown>> {
  const fields = LOGIN_FIELDS_LIST;

  // 1) Validate input → Result<FormSuccess<{ email; password }>, ValidationError>
  const validated = await validateFormGeneric(formData, LoginSchema, fields);

  if (!validated.ok) {
    return toFormValidationErr<LoginField, unknown>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw: Object.fromEntries(formData.entries()),
    });
  }

  // 2) Authenticate
  const input = {
    email: validated.value.data.email,
    password: asPasswordRaw(validated.value.data.password as unknown as string),
  };

  const service = new UserAuthFlowService(getAppDb());
  const res = await service.login(input);

  if (!res.ok) {
    // Domain error → generic form validation error for UI
    const dense = setSingleFieldErrorMessage(
      fields,
      "Login failed. Please try again.",
    );
    return toFormValidationErr<LoginField, unknown>({
      fieldErrors: dense,
      fields,
      raw: Object.fromEntries(formData.entries()),
    });
  }

  // 3) Session + redirect
  try {
    await setSessionToken(toUserId(res.value.id), toUserRole(res.value.role));
  } catch (err) {
    serverLogger.error({
      context: "login.action.session",
      error:
        err instanceof Error
          ? { message: err.message, name: err.name }
          : { message: "Unknown error" },
      message: "Failed to establish session",
    });
    const dense = setSingleFieldErrorMessage(
      fields,
      "Unexpected error. Please try again.",
    );
    return toFormValidationErr<LoginField, unknown>({
      fieldErrors: dense,
      fields,
      raw: Object.fromEntries(formData.entries()),
    });
  }

  // success path: small ok result before redirect (useful for progressive enhancement)
  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<LoginField, unknown>({});
}
