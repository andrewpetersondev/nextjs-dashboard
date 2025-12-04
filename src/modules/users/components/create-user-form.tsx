"use client";
import { type JSX, useActionState } from "react";
import type { FormResult } from "@/modules/forms/domain/types/form-result.types";
import { createInitialFailedFormStateFromSchema } from "@/modules/forms/infrastructure/create-initial-form-state";
import { UserForm } from "@/modules/users/components/user-form";
import { USERS_DASHBOARD_PATH } from "@/modules/users/domain/user.constants";
import { CreateUserFormSchema } from "@/modules/users/lib/user.schema";
import { createUserAction } from "@/modules/users/server/application/actions/create";

export function CreateUserForm(): JSX.Element {
  const initialState =
    createInitialFailedFormStateFromSchema(CreateUserFormSchema);
  const [state, action, pending] = useActionState<
    FormResult<unknown>,
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
