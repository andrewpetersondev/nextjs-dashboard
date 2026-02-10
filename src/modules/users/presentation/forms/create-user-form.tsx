"use client";
import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useActionState, useId } from "react";
import { CreateUserFormSchema } from "@/modules/users/domain/schemas/user.schema";
import { createUserAction } from "@/modules/users/presentation/actions/create-user.action";
import { UserRoleSelect } from "@/modules/users/presentation/components/user-role-select";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeInitialFormState } from "@/shared/forms/logic/factories/form-state.factory";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { FormActionRow } from "@/shared/forms/ui/components/layout/form-action-row";
import { useFormMessage } from "@/shared/forms/ui/hooks/use-form-message";
import { ROUTES } from "@/shared/routes/routes";
import { H1 } from "@/ui/atoms/headings";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { ServerMessage } from "@/ui/molecules/server-message";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

type CreateUserFieldNames = "email" | "password" | "role" | "username";

// biome-ignore lint/nursery/useExplicitType: fix
const INITIAL_STATE = makeInitialFormState<CreateUserFieldNames>(
  Object.keys(CreateUserFormSchema.shape) as readonly CreateUserFieldNames[],
);

function CreateUserFormFields({
  disabled = false,
  errors,
}: {
  disabled?: boolean;
  errors?: Partial<Record<CreateUserFieldNames, readonly string[]>>;
}): JSX.Element {
  const emailId = useId();
  const passwordId = useId();
  const usernameId = useId();

  return (
    <div className="space-y-6">
      <InputFieldMolecule
        autoComplete="username"
        dataCy="user-username-input"
        disabled={disabled}
        error={errors?.username as readonly [string, ...string[]] | undefined}
        icon={
          <UserIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
        }
        id={usernameId}
        label="Username"
        name="username"
        required={true}
        type="text"
      />

      <InputFieldMolecule
        autoComplete="email"
        dataCy="user-email-input"
        disabled={disabled}
        error={errors?.email as readonly [string, ...string[]] | undefined}
        icon={
          <AtSymbolIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
        }
        id={emailId}
        label="Email address"
        name="email"
        placeholder="steve@jobs.com"
        required={true}
        type="email"
      />

      <InputFieldMolecule
        autoComplete="off"
        dataCy="user-password-input"
        disabled={disabled}
        error={errors?.password as readonly [string, ...string[]] | undefined}
        icon={
          <LockClosedIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
        }
        id={passwordId}
        label="Password"
        name="password"
        placeholder="Enter your password"
        required={true}
        type="password"
      />

      <UserRoleSelect
        dataCy="user-role-select"
        defaultValue=""
        disabled={disabled}
        error={errors?.role as readonly [string, ...string[]] | undefined}
      />
    </div>
  );
}

export function CreateUserForm(): JSX.Element {
  const [state, action, pending] = useActionState<
    FormResult<unknown>,
    FormData
  >(createUserAction, INITIAL_STATE);

  const showAlert = useFormMessage(state);

  const fieldErrors = state.ok
    ? undefined
    : extractFieldErrors<CreateUserFieldNames>(state.error);

  return (
    <div>
      <H1>Create User</H1>
      <section>
        <p>Admins can create users.</p>
      </section>
      <form action={action} autoComplete="off">
        <CreateUserFormFields disabled={pending} errors={fieldErrors} />
        <FormActionRow cancelHref={ROUTES.dashboard.users}>
          <SubmitButtonMolecule label="Create User" pending={pending} />
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
}
