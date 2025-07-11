"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { type JSX, useActionState, useEffect, useState } from "react";
import { FormActionRow } from "@/components/form-action-row";
import { FormSubmitButton } from "@/components/form-submit-button";
import { updateUserAction } from "@/features/users/user.actions";
import type { UserDto } from "@/features/users/user.dto";
import type { EditUserFormFields } from "@/features/users/user.types";
import type { FormState } from "@/lib/definitions/form.types";
import { ServerMessage } from "@/ui/users/server-message";

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
  const initialState = {
    errors: {},
    message: "",
    success: undefined,
  };

  const updateUserWithId: (
    prevState: FormState<EditUserFormFields>,
    formData: FormData,
  ) => Promise<FormState<EditUserFormFields>> = updateUserAction.bind(
    null,
    user.id,
  );

  const [state, action, isPending] = useActionState<
    EditUserFormState,
    FormData
  >(updateUserWithId, initialState);

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000); // 4 seconds
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
  }, [state.message]);

  return (
    <div>
      <form action={action}>
        {/* hidden id for user */}
        <input name="id" type="hidden" value={user.id} />

        {/* username */}
        <div className="mb-4">
          <div className="rounded-md bg-bg-secondary p-4 md:p-6">
            <label
              className="mb-2 block font-medium text-sm"
              htmlFor="username"
            >
              Username: {user.username}
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  aria-describedby="update-user-username-error"
                  className="peer block w-full cursor-pointer rounded-md border border-bg-accent py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary"
                  defaultValue={user.username}
                  id="username"
                  name="username"
                  placeholder="Enter username..."
                  type="text"
                />
                <UserCircleIcon
                  aria-hidden="true"
                  className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] text-text-primary"
                />
              </div>
            </div>
            <div
              aria-atomic="true"
              aria-live="polite"
              id="update-user-username-error"
            >
              {state.errors?.username?.map(
                (error: string): JSX.Element => (
                  <p className="mt-2 text-sm text-text-error" key={error}>
                    {error}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>

        {/* email */}
        <div className="mb-4">
          <div className="rounded-md bg-bg-secondary p-4 md:p-6">
            <label className="mb-2 block font-medium text-sm" htmlFor="email">
              Email: {user.email}
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  aria-describedby="update-user-email-error"
                  className="peer block w-full cursor-pointer rounded-md border border-bg-accent py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary"
                  defaultValue={user.email}
                  id="email"
                  name="email"
                  placeholder="Enter email..."
                  type="email"
                />
                <UserCircleIcon
                  aria-hidden="true"
                  className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] text-text-primary"
                />
              </div>
            </div>
            <div
              aria-atomic="true"
              aria-live="polite"
              id="update-user-email-error"
            >
              {state.errors?.email?.map(
                (error: string): JSX.Element => (
                  <p className="mt-2 text-sm text-text-error" key={error}>
                    {error}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>

        {/* password */}
        <div className="mb-4">
          <div className="rounded-md bg-bg-secondary p-4 md:p-6">
            <label
              className="mb-2 block font-medium text-sm"
              htmlFor="password"
            >
              Password:
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  aria-describedby="update-user-password-error"
                  className="peer block w-full cursor-pointer rounded-md border border-bg-accent py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary"
                  id="password"
                  name="password"
                  placeholder="Enter password..."
                  type="password"
                />
                <UserCircleIcon
                  aria-hidden="true"
                  className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] text-text-primary"
                />
              </div>
            </div>
            <div
              aria-atomic="true"
              aria-live="polite"
              id="update-user-password-error"
            >
              {state.errors?.password?.map(
                (error: string): JSX.Element => (
                  <p className="mt-2 text-sm text-text-error" key={error}>
                    {error}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="mb-2 block font-medium text-sm" htmlFor="role">
            Choose Role
          </label>
          <div className="relative">
            <select
              className="peer block w-full cursor-pointer rounded-md border border-bg-accent py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary"
              defaultValue={user.role}
              id="role"
              name="role"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <UserCircleIcon
              aria-hidden="true"
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] text-text-primary"
            />
          </div>
          <div
            aria-atomic="true"
            aria-live="polite"
            id="update-user-role-error"
          >
            {state.errors?.role?.map(
              (error: string): JSX.Element => (
                <p className="mt-2 text-sm text-text-error" key={error}>
                  {error}
                </p>
              ),
            )}
          </div>
        </div>
        <FormActionRow cancelHref="/dashboard/users">
          <FormSubmitButton
            data-cy="edit-user-submit-button"
            pending={isPending}
          >
            Update User
          </FormSubmitButton>
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
}
