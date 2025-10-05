"use server";
import type { SignupField } from "@/features/auth/lib/auth.schema";
import { signupCommandSchema } from "@/features/auth/lib/auth-commands.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type {
  FormResult,
  FormSuccess,
  FormValidationError,
} from "@/shared/forms/types/form-state.type";

// Shape returned by validateFormGeneric for failure path is compatible with FormValidationError
type SignupFormResult = FormResult<SignupField, unknown>;

/**
 * Server Action for signup.
 * Returns only DTOs or redirects; never returns the Service Result union.
 * Shows progressive enhancement pattern: client can optimistically reflect input, server re-validates and returns authoritative state.
 */
export async function signupAction(
  _prevState: SignupFormResult, // kept for progressive enhancement, not used
  formData: FormData,
): Promise<SignupFormResult> {
  try {
    // 1) Boundary validation via shared helper (reduces complexity)
    const validation = await validateFormGeneric(
      formData,
      signupCommandSchema,
      ["email", "username", "password"] as const,
      { loggerContext: "actions.signup" },
    );

    if (!validation.success || !validation.data) {
      return {
        error: {
          fieldErrors: validation.errors as DenseFieldErrorMap<SignupField>,
          kind: "validation",
          message: validation.message ?? "Invalid data",
          values: validation.values,
        } satisfies FormValidationError<SignupField>,
        ok: false,
      };
    }

    // 2) Call Service
    const service = new UserAuthFlowService(getAppDb());
    const result = await service.signup(validation.data);

    // 3) Map Service Result → FormResult
    if (result.ok) {
      await setSessionToken(
        toUserId(result.value.id),
        toUserRole(result.value.role),
      );
      return {
        ok: true,
        value: {
          data: null,
          message: "Signed up successfully",
        } as FormSuccess<unknown>,
      };
    }

    return {
      error: {
        fieldErrors: result.error,
        kind: "validation",
        message: "Please fix the highlighted fields",
      },
      ok: false,
    };
  } catch (error) {
    serverLogger.error(
      { context: "actions.signup", err: error, kind: "exception" },
      "Unhandled exception",
    );
    return {
      error: {
        fieldErrors: { email: [], password: [], username: [] },
        kind: "validation",
        message: "Something went wrong. Please try again.",
      },
      ok: false,
    };
  }
  //  redirect("/dashboard");
}
