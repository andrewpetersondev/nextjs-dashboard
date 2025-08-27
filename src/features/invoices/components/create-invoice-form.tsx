"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceServerMessage } from "@/features/invoices/components/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import type {
  CreateInvoiceFormFieldNames,
  CreateInvoiceFormFields,
} from "@/features/invoices/types";
import { createInvoiceAction } from "@/server/invoices/actions/create";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { ALERT_AUTO_HIDE_MS } from "@/shared/ui/ui";
import { getCurrentIsoDate } from "@/shared/utils/date";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";
import { Label } from "@/ui/primitives/label";

const INITIAL_STATE = {
  errors: {} as Partial<Record<CreateInvoiceFormFieldNames, FormFieldError>>,
  message: "",
  success: false,
} satisfies Extract<FormState<CreateInvoiceFormFieldNames>, { success: false }>;

export const CreateInvoiceForm = ({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element => {
  const [state, action, pending] = useActionState<
    FormState<CreateInvoiceFormFieldNames, CreateInvoiceFormFields>,
    FormData
  >(createInvoiceAction, INITIAL_STATE);

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), ALERT_AUTO_HIDE_MS);
      return () => clearTimeout(timer);
    }

    setShowAlert(false);
    return undefined;
  }, [state.message]);

  return (
    <section>
      <form action={action}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <InvoiceDate defaultValue={getCurrentIsoDate()} />

          <SensitiveData
            disabled={pending}
            error={state.errors?.sensitiveData as FormFieldError | undefined}
          />

          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />

            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue=""
              disabled={pending}
              error={state.errors?.customerId as FormFieldError | undefined}
            />
          </div>

          <InvoiceAmountInput
            dataCy="amount-input"
            disabled={pending}
            error={state.errors?.amount as FormFieldError | undefined}
            id="amount"
            label="Choose an amount"
            name="amount"
            placeholder="Enter USD amount"
            step="0.01"
            type="number"
          />

          <InvoiceStatusRadioGroup
            data-cy="status-radio"
            disabled={pending}
            error={state.errors?.status as FormFieldError | undefined}
            name="status"
            value="pending"
          />
        </div>

        <FormActionRow cancelHref="/dashboard/invoices">
          <FormSubmitButton
            data-cy="create-invoice-submit-button"
            pending={pending}
          >
            Create Invoice
          </FormSubmitButton>
        </FormActionRow>
      </form>
      <InvoiceServerMessage showAlert={showAlert} state={state} />
    </section>
  );
};
