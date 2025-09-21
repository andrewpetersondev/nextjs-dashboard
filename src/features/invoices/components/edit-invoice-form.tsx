"use client";

import { type JSX, useActionState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import { useAutoHideAlert } from "@/features/invoices/hooks/useAutoHideAlert";
import type {
  EditInvoiceViewModel,
  UpdateInvoiceFieldNames,
  UpdateInvoiceInput,
} from "@/features/invoices/lib/invoice.schema";
import { ServerMessage } from "@/features/users/components/server-message";
import { updateInvoiceAction } from "@/server/invoices/actions/update";
import type { FormFieldError, FormState } from "@/shared/forms/form-types";
import { CENTS_IN_DOLLAR } from "@/shared/money/types";
import { Label } from "@/ui/atoms/label";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";

// Helper: produce initial state (keeps component short)
function getInitialState(): Extract<
  FormState<UpdateInvoiceFieldNames>,
  { success: false }
> {
  return {
    errors: {} as Partial<Record<UpdateInvoiceFieldNames, FormFieldError>>,
    message: "",
    success: false,
  };
}

// Helper: build the server action expected by useActionState
function createWrappedUpdateAction(invoiceId: string) {
  return async (
    prevState: FormState<UpdateInvoiceFieldNames, UpdateInvoiceInput>,
    formData: FormData,
  ): Promise<FormState<UpdateInvoiceFieldNames, UpdateInvoiceInput>> =>
    await updateInvoiceAction(prevState, invoiceId, formData);
}

// Presentational: invoice form fields
function FormFields({
  currentInvoice,
  customers,
  errors,
  pending,
}: {
  currentInvoice: EditInvoiceViewModel;
  customers: CustomerField[];
  errors: Partial<Record<UpdateInvoiceFieldNames, FormFieldError>>;
  pending: boolean;
}): JSX.Element {
  return (
    <div className="rounded-md bg-bg-secondary p-4 md:p-6">
      <InvoiceDate data-cy="date-input" defaultValue={currentInvoice.date} />

      <SensitiveData
        disabled={pending}
        error={errors?.sensitiveData as FormFieldError | undefined}
      />

      <div className="mb-4">
        <Label htmlFor="customer" text="Choose customer" />
        <CustomerSelect
          customers={customers}
          dataCy="customer-select"
          defaultValue={currentInvoice.customerId}
          disabled={pending}
          error={errors?.customerId as FormFieldError | undefined}
        />
      </div>

      <InvoiceAmountInput
        dataCy="amount-input"
        defaultValue={currentInvoice.amount / CENTS_IN_DOLLAR}
        disabled={pending}
        error={errors?.amount as FormFieldError | undefined}
        id="amount"
        label="Choose an amount"
        name="amount"
      />

      <InvoiceStatusRadioGroup
        data-cy="invoice-status-radio-group"
        disabled={pending}
        error={errors?.status as FormFieldError | undefined}
        name="status"
        value={currentInvoice.status}
      />
    </div>
  );
}

export const EditInvoiceForm = ({
  invoice,
  customers,
}: {
  invoice: EditInvoiceViewModel; // fully populated for UI defaults
  customers: CustomerField[];
}): JSX.Element => {
  const [state, action, pending] = useActionState<
    FormState<UpdateInvoiceFieldNames, UpdateInvoiceInput>,
    FormData
  >(createWrappedUpdateAction(invoice.id), getInitialState());

  // Build a view-model for the UI:
  // - Before submit: use the provided invoice (required fields)
  // - After successful submit: merge the server-validated patch into the existing view
  const currentInvoice: EditInvoiceViewModel =
    state.success && state.data
      ? ({ ...invoice, ...state.data } as EditInvoiceViewModel)
      : invoice;

  const showAlert = useAutoHideAlert(state.message);

  return (
    <div>
      <form action={action}>
        <FormFields
          currentInvoice={currentInvoice}
          customers={customers}
          errors={state.errors ?? {}}
          pending={pending}
        />

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
