"use client";

import { type JSX, useActionState } from "react";
import { UserForm } from "@/features/users/components/user-form";
import { UserInfoPanel } from "@/features/users/components/user-info-panel";
import { updateUserAction } from "@/server/users/actions";
import type { UserDto } from "@/server/users/dto";

type EditUserFormState = Readonly<{
  errors?: {
    username?: string[];
    email?: string[];
    role?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
}>;

export function EditUserFormV2({ user }: { user: UserDto }): JSX.Element {
  const initialState = { errors: {}, message: "", success: undefined };
  const updateUserWithId = updateUserAction.bind(null, user.id) as (
    prevState: EditUserFormState,
    formData: FormData,
  ) => Promise<EditUserFormState>;

  const [state, action, pending] = useActionState(
    updateUserWithId,
    initialState,
  );

  return (
    <UserForm
      action={action}
      cancelHref="/dashboard/users"
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
