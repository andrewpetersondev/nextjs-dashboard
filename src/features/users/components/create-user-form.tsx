"use client";

import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import {
  type CreateUserFormFieldNames,
  CreateUserFormSchema,
} from "@/features/users/lib/user.schema";
import { createUserAction } from "@/server/users/actions/create";
import { buildInitialFailedFormStateFromSchema } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";

export function CreateUserForm(): JSX.Element {
  const initialState =
    buildInitialFailedFormStateFromSchema(CreateUserFormSchema);
  const [state, action, pending] = useActionState<
    FormState<CreateUserFormFieldNames>,
    FormData
  >(createUserAction, initialState);

  return (
    <UserForm
      action={action}
      cancelHref={USERS_DASHBOARD_PATH}
      description="Admins can create users."
      isEdit={false}
      pending={pending}
      showPassword={true}
      state={state}
      submitLabel="Create User"
      title="Create User"
    />
  );
}
