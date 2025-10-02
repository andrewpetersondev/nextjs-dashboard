"use server";

import { redirect } from "next/navigation";
import type { SignupField } from "@/features/auth/lib/auth.schema";
import { signupCommandSchema } from "@/features/auth/lib/auth-commands.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import type { FormState } from "@/shared/forms/types/form-state.type";

/**
 * Server Action for signup.
 * Returns only DTOs or redirects; never returns the Service Result union.
 * Shows progressive enhancement pattern: client can optimistically reflect input, server re-validates and returns authoritative state.
 */
export async function signupAction(
  _prevState: FormState<SignupField, unknown>,
  formData: FormData,
): Promise<FormState<SignupField, unknown>> {
  try {
    // 1) Boundary validation via shared helper (reduces complexity)
    const validation = await validateFormGeneric(
      formData,
      signupCommandSchema,
      ["email", "username", "password"] as const,
      { loggerContext: "actions.signup" },
    );

    if (!validation.success || !validation.data) {
      return validation;
    }

    // 2) Call Service
    const service = new UserAuthFlowService(getDB());
    const result = await service.signup(validation.data);

    // 3) Map Service Result → FormState
    if (result.success) {
      await setSessionToken(
        toUserId(result.data.id),
        toUserRole(result.data.role),
      );
    }
  } catch (error) {
    serverLogger.error(
      { context: "actions.signup", err: error, kind: "exception" },
      "Unhandled exception",
    );
    return {
      errors: { email: [], password: [], username: [] },
      message: "Something went wrong. Please try again.",
      success: false,
    };
  }
  redirect("/dashboard");
}
