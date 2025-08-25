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

// Helper: produce initial state (keeps component short)
function getInitialState(): Extract<
  FormState<BaseInvoiceFormFieldNames>,
  { success: false }
> {
  return {
    errors: {} as Partial<Record<BaseInvoiceFormFieldNames, FormFieldError>>,
    message: "",
    success: false,
  };
}

// Helper: build the server action expected by useActionState
function createWrappedUpdateAction(invoiceId: string) {
  return async (
    prevState: FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>,
    formData: FormData,
  ): Promise<FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>> =>
    await updateInvoiceAction(prevState, invoiceId, formData);
}

// Hook: auto-hide alert when message changes
function useAutoHideAlert(message: string): boolean {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!message) {
      setShowAlert(false);
      return;
    }
    setShowAlert(true);
    const timer = setTimeout(
      () => setShowAlert(false),
      TIMER.ALERT_AUTO_HIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [message]);

  return showAlert;
}

export const EditInvoiceForm = ({
  invoice,
  customers,
}: {
  invoice: UpdateInvoiceFormFields;
  customers: CustomerField[];
}): JSX.Element => {
  const [state, action, pending] = useActionState<
    FormState<BaseInvoiceFormFieldNames, BaseInvoiceFormFields>,
    FormData
  >(createWrappedUpdateAction(invoice.id), getInitialState());

  const currentInvoice = state.success ? state.data : invoice;
  const showAlert = useAutoHideAlert(state.message);

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
