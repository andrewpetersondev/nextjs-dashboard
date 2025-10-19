import "server-only";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { mapAppErrorToFormResult } from "@/server/auth/application/mapping/app-error.to-form-result.mapper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { toUnexpectedAppError } from "@/server/auth/domain/errors/app-error.factories";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import { pickFormDataFields } from "@/shared/forms/fields/formdata.extractor";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.types";

const LOGGER_CONTEXT = "auth.signup";
const fields = SIGNUP_FIELDS_LIST;

export async function executeSignupCommand(
  formData: FormData,
): Promise<FormResult<SignupField, AuthUserTransport>> {
  const raw = pickFormDataFields<SignupField>(formData, fields);
  const validated = await validateFormGeneric(formData, SignupSchema, fields, {
    loggerContext: LOGGER_CONTEXT,
  });

  if (!validated.ok) {
    return toFormValidationErr<SignupField, AuthUserTransport>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw,
    });
  }

  const input: SignupData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const result = await flatMapAsync((i: SignupData) => service.signup(i))(
    Ok(input),
  ).then(mapOk((user) => user));

  if (!result.ok) {
    const svcError = toUnexpectedAppError(result.error);
    return mapAppErrorToFormResult<SignupField, AuthUserTransport>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  return toFormOk<SignupField, AuthUserTransport>(result.value);
}
