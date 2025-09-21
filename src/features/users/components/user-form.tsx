import { type JSX, type ReactNode, useEffect, useState } from "react";
import { ServerMessage } from "@/features/users/components/server-message";
import { UserFields } from "@/features/users/components/user-fields";
import type { UserDto } from "@/features/users/dto/types";
import type { FormFieldError, FormState } from "@/shared/forms/form-types";
import { TYPING_MS } from "@/shared/ui/tokens/timings";
import { H1 } from "@/ui/atoms/typography/headings";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";

// Make the form generic over field names to support both create and edit flows
type Props<TFieldNames extends string> = {
  title: string;
  description: string;
  action: (formData: FormData) => void;
  state: FormState<TFieldNames>;
  pending: boolean;
  initialValues?: Partial<UserDto> & { password?: string };
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
      const timer = setTimeout(() => setShowAlert(false), TYPING_MS);
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return;
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
