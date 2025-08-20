"use client";

import { type JSX, useActionState } from "react";
import type { CreateUserFormFieldNames } from "@/features/users/user.types";
import type { FormState } from "@/lib/forms/form.types";
import { createUserAction } from "@/server/actions/user.actions";
import { UserForm } from "@/ui/users/user-form";

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
