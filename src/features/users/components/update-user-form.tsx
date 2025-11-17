"use client";
import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { UserInfoPanel } from "@/features/users/components/user-info-panel";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import type { UserDto } from "@/features/users/lib/dto";
import { EditUserFormSchema } from "@/features/users/lib/user.schema";
import { updateUserAction } from "@/server/users/actions/update";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/infrastructure/initial-state";

export function UpdateUserForm({ user }: { user: UserDto }): JSX.Element {
  const initialState =
    createInitialFailedFormStateFromSchema(EditUserFormSchema);

  const updateUserWithId = updateUserAction.bind(null, user.id) as (
    prevState: FormResult<unknown>,
    formData: FormData,
  ) => Promise<FormResult<unknown>>;

  const [state, action, pending] = useActionState<
    FormResult<unknown>,
    FormData
  >(updateUserWithId, initialState);

  return (
    <UserForm
      action={action}
      cancelHref={USERS_DASHBOARD_PATH}
      description="Admins can edit any profile."
      extraContent={<UserInfoPanel user={user} />}
      initialValues={{
        email: user.email,
        id: user.id,
        role: user.role,
        username: user.username,
      }}
      isEdit={true}
      pending={pending}
      showPassword={true}
      state={state}
      submitLabel="Save Changes"
      title="Edit User"
    />
  );
}
