import { type JSX, type ReactNode, useEffect, useState } from "react";
import { ServerMessage } from "@/features/users/components/server-message";
import { UserFields } from "@/features/users/components/user-fields";
import { FormActionRow } from "@/ui/form-action-row";
import { FormSubmitButton } from "@/ui/form-submit-button";
import { H1 } from "@/ui/headings";

type ErrorType = {
  username?: string[];
  email?: string[];
  role?: string[];
  password?: string[];
};

type UserFormState = {
  errors?: ErrorType;
  message?: string;
  success?: boolean;
};

type Props = {
  title: string;
  description: string;
  action: (formData: FormData) => void;
  state: UserFormState;
  pending: boolean;
  initialValues?: Partial<{
    id: string;
    username: string;
    email: string;
    role: string;
  }>;
  isEdit?: boolean;
  showPassword?: boolean;
  submitLabel: string;
  cancelHref: string;
  extraContent?: ReactNode;
};

export function UserForm({
  title,
  description,
  action,
  state,
  pending,
  initialValues,
  isEdit = false,
  showPassword = true,
  submitLabel,
  cancelHref,
  extraContent,
}: Props): JSX.Element {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000);
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return undefined;
  }, [state.message]);

  return (
    <div>
      <H1>{title}</H1>
      <section>
        <p>{description}</p>
      </section>
      {extraContent}
      <form action={action} autoComplete="off">
        <UserFields
          errors={state.errors}
          isEdit={isEdit}
          showPassword={showPassword}
          values={initialValues}
        />
        <FormActionRow cancelHref={cancelHref}>
          <FormSubmitButton pending={pending}>{submitLabel}</FormSubmitButton>
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
}
