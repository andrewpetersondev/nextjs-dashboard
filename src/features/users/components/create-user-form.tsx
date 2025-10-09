"use client";

import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import {
  type CreateUserFormFieldNames,
  CreateUserFormSchema,
} from "@/features/users/lib/user.schema";
import { createUserAction } from "@/server/users/actions/create";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/errors/init-failed-form-state";
import type { FormResult } from "@/shared/forms/types/form-result.type";

export function CreateUserForm(): JSX.Element {
  const initialState =
    createInitialFailedFormStateFromSchema(CreateUserFormSchema);
  const [state, action, pending] = useActionState<
    FormResult<CreateUserFormFieldNames, unknown>,
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
