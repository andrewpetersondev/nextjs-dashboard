import { type JSX, type ReactNode, useEffect, useState } from "react";
import { ServerMessage } from "@/features/users/components/server-message";
import { UserFields } from "@/features/users/components/user-fields";
// ... existing code ...
import { TIMER } from "@/shared/constants/ui";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormActionRow } from "@/ui/form-action-row";
import { FormSubmitButton } from "@/ui/form-submit-button";
import { H1 } from "@/ui/headings";

// Make the form generic over field names to support both create and edit flows
type Props<TFieldNames extends string> = {
  title: string;
  description: string;
  action: (formData: FormData) => void;
  state: FormState<TFieldNames>;
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

export function UserForm<TFieldNames extends string>({
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
}: Props<TFieldNames>): JSX.Element {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), TIMER.TYPING_MS);
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
          // Disable inputs while pending to prevent changes mid-submit
          disabled={pending}
          // Adapt generic state.errors to the concrete UserFields error shape
          errors={state.errors as Record<string, FormFieldError> | undefined}
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
