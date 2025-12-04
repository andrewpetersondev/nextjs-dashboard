import { type JSX, type ReactNode, useEffect, useMemo, useState } from "react";
import { FormActionRow } from "@/modules/forms/components/form-action-row";
import { FormSubmitButton } from "@/modules/forms/components/form-submit-button";
import type { FieldError } from "@/modules/forms/domain/types/field-error.types";
import type { FormResult } from "@/modules/forms/domain/types/form-result.types";
import { ServerMessage } from "@/modules/users/components/server-message";
import { UserFields } from "@/modules/users/components/user-fields";
import type { UserDto } from "@/modules/users/domain/user.dto";
import { H1 } from "@/ui/atoms/typography/headings";
import { TYPING_MS } from "@/ui/timings.tokens";

// Make the form generic over field names to support both create and edit flows
type Props = {
  title: string;
  description: string;
  action: (formData: FormData) => void;
  state: FormResult<unknown>;
  pending: boolean;
  initialValues?: Partial<UserDto> & { password?: string };
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
          errors={
            state.ok
              ? undefined
              : (state.error?.metadata?.fieldErrors as unknown as
                  | Record<string, FieldError>
                  | undefined)
          }
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
