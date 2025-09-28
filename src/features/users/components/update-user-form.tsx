"use client";

import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { UserInfoPanel } from "@/features/users/components/user-info-panel";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import type { UserDto } from "@/features/users/lib/dto";
import {
  type EditUserFormFieldNames,
  EditUserFormSchema,
} from "@/features/users/lib/user.schema";
import { updateUserAction } from "@/server/users/actions/update";
import { buildInitialFailedFormStateFromSchema } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";

export function UpdateUserForm({ user }: { user: UserDto }): JSX.Element {
  const initialState =
    buildInitialFailedFormStateFromSchema(EditUserFormSchema);

  const updateUserWithId = updateUserAction.bind(null, user.id) as (
    prevState: FormState<EditUserFormFieldNames>,
    formData: FormData,
  ) => Promise<FormState<EditUserFormFieldNames>>;

  const [state, action, pending] = useActionState<
    FormState<EditUserFormFieldNames>,
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
