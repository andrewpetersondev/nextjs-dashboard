"use client";

import { type JSX, useActionState } from "react";
import type { UserDto } from "@/features/users/user.dto";
import { updateUserAction } from "@/server/actions/user";
import { UserForm } from "@/ui/users/user-form";
import { UserInfoPanel } from "@/ui/users/user-info-panel";

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

export function EditUserForm({ user }: { user: UserDto }): JSX.Element {
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
