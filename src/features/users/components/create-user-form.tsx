"use client";
import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import { CreateUserFormSchema } from "@/features/users/lib/user.schema";
import { createUserAction } from "@/server/users/actions/create";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/state/initial-state";

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
