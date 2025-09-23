"use server";

import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS,
  type SignupFormFieldNames,
  SignupFormSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { UsersRepository } from "@/server/users/repo";
import { UsersService } from "@/server/users/service";
import { toUserId } from "@/shared/domain/id-converters";
import { FORM_ERROR_MESSAGES } from "@/shared/forms/form-messages";
import type { DenseErrorMap, FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { ROUTES } from "@/shared/routes/routes";

type SignupSuccess = {
  id: string;
  email: string;
  username: string;
  role: string;
};

// Helper to create a dense error map with empty arrays for each field
function makeEmptyDense<TField extends string>(
  fields: readonly TField[],
): DenseErrorMap<TField> {
  const acc = {} as Record<TField, readonly string[]>;
  for (const f of fields) {
    acc[f] = [];
  }
  return acc;
}

function repoErrorToDense<TField extends SignupFormFieldNames>(
  e: { kind: "DatabaseError" | "CreateFailed"; message: string },
  fields: readonly TField[],
): DenseErrorMap<TField> {
  // Build a dense map with empty readonly arrays (typed safely)
  const empty = makeEmptyDense(fields);
  // Attach the error message to the first field as a generic/root message
  const target = (fields[0] ?? ("username" as TField)) as TField;
  return { ...empty, [target]: [e.message] as const };
}

// Keep the returned state consistent and never throw before redirect.
export async function signup(
  _prev: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  const fields = SIGNUP_FIELDS;

  // Ensure we only pick known fields to avoid unsafe extras from FormData
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    username: String(formData.get("username") ?? ""),
  };

  const parsed = SignupFormSchema.safeParse(raw);
  if (!parsed.success) {
    const dense = makeEmptyDense<SignupFormFieldNames>(fields);
    return {
      errors: dense,
      message: FORM_ERROR_MESSAGES.FAILED_VALIDATION,
      success: false,
    };
  }

  const service = new UsersService(new UsersRepository(getDB()));
  const res = await service.signup({
    email: parsed.data.email,
    password: parsed.data.password,
    username: parsed.data.username,
  });

  if (!res.success) {
    const denseErrors = repoErrorToDense(res.error, fields);
    return resultToFormState<SignupFormFieldNames, SignupSuccess>(
      { error: denseErrors, success: false },
      {
        failureMessage: FORM_ERROR_MESSAGES.SUBMIT_FAILED,
        fields,
        raw,
      },
    );
  }

  await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  redirect(ROUTES.DASHBOARD.ROOT);
}
