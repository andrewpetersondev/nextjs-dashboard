"use client";
import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  type JSX,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { CreateUserFormSchema } from "@/modules/users/domain/user.schema";
import { createUserAction } from "@/modules/users/server/application/actions/create-user.action";
import { ServerMessage } from "@/modules/users/ui/components/server-message";
import { UserRoleSelect } from "@/modules/users/ui/components/user-role-select";
import { FormActionRow } from "@/shared/forms/components/form-action-row";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/infrastructure/create-initial-form-state";
import type { FieldError } from "@/shared/forms/types/form.types";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { ROUTES } from "@/shared/routes/routes";
import { H1 } from "@/ui/atoms/headings";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { TYPING_MS } from "@/ui/styles/timings.tokens";

type CreateUserFieldErrors = Partial<
  Record<"email" | "password" | "role" | "username", FieldError>
>;

function CreateUserFormFields({
  disabled = false,
  errors,
}: {
  disabled?: boolean;
  errors?: CreateUserFieldErrors;
}): JSX.Element {
  const emailId = useId();
  const passwordId = useId();
  const usernameId = useId();

  return (
    <>
      <InputFieldMolecule
        autoComplete="username"
        dataCy="user-username-input"
        disabled={disabled}
        error={errors?.username}
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
        error={errors?.email}
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
        error={errors?.password}
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
        error={errors?.role}
      />
    </>
  );
}

export function CreateUserForm(): JSX.Element {
  const [showAlert, setShowAlert] = useState(false);
  const initialState =
    createInitialFailedFormStateFromSchema(CreateUserFormSchema);

  const [state, action, pending] = useActionState<
    FormResult<unknown>,
    FormData
  >(createUserAction, initialState);

  const message = useMemo<string | undefined>(() => {
    return state.ok ? state.value.message : state.error.message;
  }, [state]);

  useEffect(() => {
    if (message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), TYPING_MS);
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return;
  }, [message]);

  const fieldErrors = state.ok
    ? undefined
    : (state.error?.metadata?.fieldErrors as CreateUserFieldErrors | undefined);

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
