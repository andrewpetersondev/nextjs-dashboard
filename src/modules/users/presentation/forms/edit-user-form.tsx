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
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { EditUserFormSchema } from "@/modules/users/domain/schemas/user.schema";
import { updateUserAction } from "@/modules/users/presentation/actions/update-user.action";
import { UserInfoPanel } from "@/modules/users/presentation/components/user-info-panel";
import { UserRoleSelect } from "@/modules/users/presentation/components/user-role-select";
import { isValidationMetadata } from "@/shared/errors/core/error-metadata.value";
import type { FieldError } from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeInitialFormStateFromSchema } from "@/shared/forms/logic/factories/form-state.factory";
import { FormActionRow } from "@/shared/forms/ui/components/form-action-row";
import { ROUTES } from "@/shared/routes/routes";
import { H1 } from "@/ui/atoms/headings";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { ServerMessage } from "@/ui/molecules/server-message";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { TYPING_MS } from "@/ui/styles/timings.tokens";

type EditUserFieldErrors = Partial<
  Record<"email" | "password" | "role" | "username", FieldError>
>;

function EditUserFormFields({
  disabled = false,
  errors,
  values,
}: {
  disabled?: boolean;
  errors?: EditUserFieldErrors;
  values: UserDto;
}): JSX.Element {
  const emailId = useId();
  const passwordId = useId();
  const usernameId = useId();
  return (
    <>
      <InputFieldMolecule
        autoComplete="username"
        dataCy="user-username-input"
        defaultValue={values.username}
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
        defaultValue={values.email}
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
        label="Password (leave blank to keep current)"
        name="password"
        placeholder="Enter new password"
        required={false}
        type="password"
      />

      <UserRoleSelect
        dataCy="user-role-select"
        defaultValue={values.role}
        error={errors?.role}
      />
    </>
  );
}

export function EditUserForm({ user }: { user: UserDto }): JSX.Element {
  const [showAlert, setShowAlert] = useState(false);
  const initialState = makeInitialFormStateFromSchema(EditUserFormSchema);

  const updateUserWithId = updateUserAction.bind(null, user.id) as (
    prevState: FormResult<unknown>,
    formData: FormData,
  ) => Promise<FormResult<unknown>>;

  const [state, action, pending] = useActionState<
    FormResult<unknown>,
    FormData
  >(updateUserWithId, initialState);

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

  const fieldErrors =
    !state.ok && isValidationMetadata(state.error.metadata)
      ? (state.error.metadata.fieldErrors as EditUserFieldErrors)
      : undefined;

  return (
    <div>
      <H1>Edit User</H1>
      <section>
        <p>Admins can edit any profile.</p>
      </section>
      <UserInfoPanel user={user} />
      <form action={action} autoComplete="off">
        <EditUserFormFields
          disabled={pending}
          errors={fieldErrors}
          values={user}
        />
        <FormActionRow cancelHref={ROUTES.dashboard.users}>
          <SubmitButtonMolecule label="Save Changes" pending={pending} />
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
}
