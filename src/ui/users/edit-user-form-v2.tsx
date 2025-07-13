"use client";

import { type JSX, useActionState } from "react";
import { updateUserAction } from "@/features/users/user.actions";
import type { UserDto } from "@/features/users/user.dto";
import type { EditUserFormFields } from "@/features/users/user.types";
import type { FormState } from "@/lib/definitions/form.types";
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

export function EditUserFormV2({ user }: { user: UserDto }): JSX.Element {
  const initialState = { errors: {}, message: "", success: undefined };
  const updateUserWithId: (
    prevState: FormState<EditUserFormFields>,
    formData: FormData,
  ) => Promise<FormState<EditUserFormFields>> = updateUserAction.bind(
    null,
    user.id,
  );

  const [state, action, pending] = useActionState<EditUserFormState, FormData>(
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
