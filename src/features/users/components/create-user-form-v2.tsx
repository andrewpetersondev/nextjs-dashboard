"use client";

import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { createUserAction } from "@/server/users/actions";
import type { CreateUserFormFieldNames } from "@/server/users/types";
import type { FormState } from "@/shared/forms/types";

export function CreateUserFormV2(): JSX.Element {
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
      cancelHref="/dashboard/users"
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
