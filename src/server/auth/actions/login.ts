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
import { setDenseFieldErrorMessage } from "@/shared/forms/errors/dense-error-map-helpers";
import { mapResultToFormResult } from "@/shared/forms/mapping/result-to-form-result.mapping";
import type {
  FormResult,
  FormValidationError,
} from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Login Server Action
 * Validates, authenticates user, starts session, then redirects.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function login(
  _prevState: FormResult<LoginField, unknown>,
  formData: FormData,
): Promise<FormResult<LoginField, unknown>> {
  const fields = LOGIN_FIELDS_LIST;

  // NOTE: Login Action is minimal to explore how it is different from Signup Action; Signup Action is maximal.
  const validated = await validateFormGeneric(formData, LoginSchema);

  // FAILED BRANCH: return FormResult from validateFormGeneric mapping
  if (!validated.ok) {
    // validated.error already carries kind/message/fieldErrors per validateFormGeneric contract.
    return {
      error: validated.error as FormValidationError<LoginField>,
      ok: false,
    };
  }

  try {
    // Brand raw password at action boundary
    const input = {
      email: validated.value.data.email,
      password: asPasswordRaw(
        validated.value.data.password as unknown as string,
      ),
    };

    const service = new UserAuthFlowService(getAppDb());
    const res = await service.login(input);

    if (!res.ok || !res.value) {
      // Map domain/service error into dense field errors for consistent UI handling.
      const dense = setDenseFieldErrorMessage(
        fields,
        "Login failed. Please try again.",
      );
      return mapResultToFormResult<LoginField, unknown>(
        { error: dense, ok: false },
        { fields, raw: {} },
      );
    }

    // Establish session only after successful login
    await setSessionToken(toUserId(res.value.id), toUserRole(res.value.role));
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

    const dense = setDenseFieldErrorMessage(
      fields,
      "Unexpected error. Please try again.",
    );
    return mapResultToFormResult<LoginField, unknown>(
      { error: dense, ok: false },
      { fields, raw: {} },
    );
  }

  // Redirect on success; never return a value after redirect.
  redirect(ROUTES.DASHBOARD.ROOT);
}
