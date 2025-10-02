"use server";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { asPasswordRaw } from "@/server/auth/types/password.types";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import { attachRootDenseMessageToField } from "@/shared/forms/errors/error-map-helpers";
import { mapResultToFormState } from "@/shared/forms/mapping/result-to-form-state.mapping";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type { FormState } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Merge service dense error map with a user-friendly root message without
 * overwriting existing field errors.
 */
function withRootMessage<N extends SignupField>(
  fields: readonly N[],
  errorMap: DenseFieldErrorMap<N> | undefined,
  rootMessage: string,
): DenseFieldErrorMap<N> {
  const root = attachRootDenseMessageToField(fields, rootMessage);
  // If service returned errors, merge field-wise; keep arrays intact
  if (errorMap) {
    const merged = { ...root } as Record<N, readonly string[]>;
    for (const f of fields) {
      const a = (root as Record<N, readonly string[]>)[f] ?? [];
      const b = (errorMap as Record<N, readonly string[]>)[f] ?? [];
      merged[f] = a.length > 0 ? a : b.length > 0 ? b : [];
    }
    return merged as DenseFieldErrorMap<N>;
  }
  return root;
}

/**
 * Signup Server Action
 * Validates, creates user, starts session, then redirects.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signup(
  _prev: FormState<SignupField, unknown>,
  formData: FormData,
): Promise<FormState<SignupField, unknown>> {
  const fields = SIGNUP_FIELDS_LIST;

  // Optional honeypot check remains (non-sensitive)
  const honeypot = (formData.get("company") ?? "") as string;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    serverLogger.warn(
      { context: "action.signup", reason: "honeypot_triggered" },
      "Signup blocked by honeypot",
    );
    const dense = attachRootDenseMessageToField(
      fields,
      "Unexpected error. Please try again.",
    );
    return mapResultToFormState<SignupField, unknown>(
      { error: dense, success: false },
      { fields, raw: {} },
    );
  }

  // Allowlist fields to avoid over-posting
  const reduced = new FormData();
  for (const f of fields) {
    const v = formData.get(f);
    if (typeof v === "string") {
      reduced.set(f, v);
    }
  }

  // Validate
  const validated = await validateFormGeneric<SignupData, SignupField>(
    reduced,
    SignupSchema,
    fields,
    { fields, loggerContext: "action.signup.validate" },
  );
  if (!validated.success || !validated.data) {
    return validated;
  }

  try {
    // Prepare input
    const brandedInput: SignupData = {
      email: validated.data.email.trim(),
      password: asPasswordRaw(String(validated.data.password)),
      username: validated.data.username.trim(),
    };

    // Call service
    const service = new UserAuthFlowService(getDB());
    const res = await service.signup(brandedInput);

    // BUGFIX: Do not spread res.error into an object; res.error is already dense field map.
    // Also, provide a root message for UX while preserving field errors.
    if (!res.success) {
      const merged = withRootMessage(
        fields,
        res.error,
        "Signup failed. Please check the fields and try again.",
      );
      return mapResultToFormState<SignupField, unknown>(
        { error: merged, success: false },
        { fields, raw: {} },
      );
    }

    // Start session
    await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  } catch (err: unknown) {
    serverLogger.error(
      {
        context: "signup.action",
        error: err instanceof Error ? { name: err.name } : { name: "Unknown" },
        kind: "unexpected",
      },
      "Unexpected error during signup action",
    );

    const dense = attachRootDenseMessageToField(
      fields,
      "Unexpected error. Please try again.",
    );
    return mapResultToFormState<SignupField, unknown>(
      { error: dense, success: false },
      { fields, raw: {} },
    );
  }

  redirect(ROUTES.DASHBOARD.ROOT);
}
