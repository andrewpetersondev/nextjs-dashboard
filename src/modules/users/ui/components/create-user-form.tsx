"use client";
import { type JSX, useActionState } from "react";
import { CreateUserFormSchema } from "@/modules/users/domain/user.schema";
import { createUserAction } from "@/modules/users/server/application/actions/create";
import { UserForm } from "@/modules/users/ui/components/user-form";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/infrastructure/create-initial-form-state";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { ROUTES } from "@/shared/routes/routes";

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
      cancelHref={ROUTES.dashboard.users}
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
