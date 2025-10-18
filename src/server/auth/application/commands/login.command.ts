import "server-only";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { mapAuthServiceErrorToFormResult } from "@/server/auth/application/mapping/auth-error.to-form-result.mapper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { toUnexpectedAuthError } from "@/server/auth/domain/errors/auth-error.factories";
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

const LOGGER_CONTEXT = "auth.login";
const fields = LOGIN_FIELDS_LIST;

export async function executeLoginCommand(
  formData: FormData,
): Promise<FormResult<LoginField, AuthUserTransport>> {
  const raw = pickFormDataFields<LoginField>(formData, fields);
  const validated = await validateFormGeneric(formData, LoginSchema, fields, {
    loggerContext: LOGGER_CONTEXT,
  });

  if (!validated.ok) {
    return toFormValidationErr<LoginField, AuthUserTransport>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw,
    });
  }

  const input: LoginData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const result = await flatMapAsync((i: LoginData) => service.login(i))(
    Ok(input),
  ).then(mapOk((user) => user));

  if (!result.ok) {
    const svcError = toUnexpectedAuthError(result.error);
    return mapAuthServiceErrorToFormResult<LoginField, AuthUserTransport>({
      conflictEmailField: "email",
      error: svcError,
      fields,
      raw,
    });
  }

  return toFormOk<LoginField, AuthUserTransport>(result.value);
}
