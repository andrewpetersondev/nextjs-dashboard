"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import type {
  BaseInvoiceFormFieldNames,
  BaseInvoiceFormFields,
  UpdateInvoiceFormFields,
} from "@/features/invoices/types";
import { ServerMessage } from "@/features/users/components/server-message";
import { updateInvoiceAction } from "@/server/invoices/actions/update";
import { TIMER } from "@/shared/constants/ui";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormActionRow } from "@/ui/form-action-row";
import { FormSubmitButton } from "@/ui/form-submit-button";
import { Label } from "@/ui/label";

export const EditInvoiceForm = ({
  invoice,
  customers,
}: {
  invoice: UpdateInvoiceFormFields;
  customers: CustomerField[];
}): JSX.Element => {
  const INITIAL_STATE = {
    errors: {} as Partial<Record<BaseInvoiceFormFieldNames, FormFieldError>>,
    message: "",
    success: false,
  } satisfies Extract<FormState<BaseInvoiceFormFieldNames>, { success: false }>;

  // Create wrapper action that matches useActionState signature
  const wrappedUpdateAction = async (
    prevState: FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>,
    formData: FormData,
  ): Promise<FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>> => {
    return await updateInvoiceAction(prevState, invoice.id, formData);
  };

  const [state, action, pending] = useActionState<
    FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>,
    FormData
  >(wrappedUpdateAction, INITIAL_STATE);

  // Use the current state data or fall back to the initial invoice
  const currentInvoice = state.success ? state.data : invoice;

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(
        () => setShowAlert(false),
        TIMER.ALERT_AUTO_HIDE_MS,
      );
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return undefined;
  }, [state.message]);

  return (
    <div>
      <form action={action}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <InvoiceDate defaultValue={currentInvoice.date} />

          <SensitiveData
            disabled={pending}
            error={state.errors?.sensitiveData as FormFieldError | undefined}
          />

          {/* Customer */}
          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue={currentInvoice.customerId}
              disabled={pending}
              error={state.errors?.customerId as FormFieldError | undefined}
            />
          </div>

          {/* Amount */}
          <InvoiceAmountInput
            dataCy="amount-input"
            defaultValue={currentInvoice.amount / 100}
            disabled={pending}
            error={state.errors?.amount as FormFieldError | undefined}
            id="amount"
            label="Choose an amount"
            name="amount"
          />

          {/* Invoice Status */}
          <InvoiceStatusRadioGroup
            data-cy="status-radio"
            disabled={pending}
            error={state.errors?.status as FormFieldError | undefined}
            name="status"
            value={currentInvoice.status}
          />
        </div>

        <FormActionRow cancelHref="/dashboard/invoices">
          <FormSubmitButton
            data-cy="edit-invoice-submit-button"
            pending={pending}
          >
            Edit Invoice
          </FormSubmitButton>
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
};
