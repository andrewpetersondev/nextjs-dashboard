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

type SignupSuccessData = {
  id: string;
  email: string;
  username: string;
  role: string;
};

/**
 * Server Action for signup.
 * Returns only DTOs or redirects; never returns the Service Result union.
 * Shows progressive enhancement pattern: client can optimistically reflect input, server re-validates and returns authoritative state.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signupAction(
  _prevState: FormState<SignupField, unknown> | undefined,
  formData: FormData,
): Promise<FormState<SignupField, SignupSuccessData>> {
  try {
    // 1) Boundary validation via shared helper (reduces complexity)
    const validation = await validateFormGeneric(
      formData,
      signupCommandSchema,
      ["email", "username", "password"] as const,
      { loggerContext: "actions.signup" },
    );
    if (!validation.success) {
      return validation;
    }

    // 2) Call Service
    const service = new UserAuthFlowService(getDB());
    const result = await service.signup(validation.data);

    // 3) Map Service Result → FormState
    if (result.success) {
      // Option A: return authoritative DTO (no redirect)
      //    return {
      //      data: {
      //        email: result.data.email,
      //        id: result.data.id,
      //        role: result.data.role,
      //        username: result.data.username,
      //      },
      //      success: true,
      //    };
      // Option B: perform a redirect after setting session, etc.
      // Start session
      await setSessionToken(
        toUserId(result.data.id),
        toUserRole(result.data.role),
      );
      redirect("/dashboard");
    }

    // Expected validation conflicts mapped to dense errors
    if (!result.success && result.error) {
      return {
        errors: {
          email: result.error.email ? [...result.error.email] : [],
          password: result.error.password ? [...result.error.password] : [],
          username: result.error.username ? [...result.error.username] : [],
        },
        message: "Validation failed",
        success: false,
      };
    }

    // Unexpected fallback
    serverLogger.error(
      { context: "actions.signup", kind: "unexpected" },
      "Signup failed unexpectedly",
    );
    return {
      errors: {
        email: [],
        password: [],
        username: [],
      },
      message: "Something went wrong. Please try again.",
      success: false,
    };
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
}
