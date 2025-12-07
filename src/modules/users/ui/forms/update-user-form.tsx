"use client";
import { type JSX, useActionState } from "react";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import { EditUserFormSchema } from "@/modules/users/domain/user.schema";
import { updateUserAction } from "@/modules/users/server/application/actions/update-user.action";
import { UserInfoPanel } from "@/modules/users/ui/components/user-info-panel";
import { UserForm } from "@/modules/users/ui/forms/user-form";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/infrastructure/create-initial-form-state";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { ROUTES } from "@/shared/routes/routes";

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
      cancelHref={ROUTES.dashboard.users}
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
