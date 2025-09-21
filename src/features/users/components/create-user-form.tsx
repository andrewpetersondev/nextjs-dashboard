"use client";

import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { USERS_DASHBOARD_PATH } from "@/features/users/constants";
import type { CreateUserFormFieldNames } from "@/features/users/lib/user.schema";
import { createUserAction } from "@/server/users/actions/create";
import type { FormState } from "@/shared/forms/form-types";

export function CreateUserForm(): JSX.Element {
  const initialState: FormState<CreateUserFormFieldNames> = {
    errors: {},
    message: "",
    success: false,
  };
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
