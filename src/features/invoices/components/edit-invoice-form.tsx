"use client";

import { type JSX, useActionState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import { useAutoHideAlert } from "@/features/invoices/hooks/useAutoHideAlert";
import {
  type EditInvoiceViewModel,
  type UpdateInvoiceFieldNames,
  type UpdateInvoiceInput,
  UpdateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import { ServerMessage } from "@/features/users/components/server-message";
import { updateInvoiceAction } from "@/server/invoices/actions/update";
import { buildInitialFailedFormStateFromSchema } from "@/shared/forms/error-mapping";
import type {
  DenseFieldErrorMap,
  FieldError,
  FormState,
} from "@/shared/forms/form-types";
import { CENTS_IN_DOLLAR } from "@/shared/money/types";
import { Label } from "@/ui/atoms/label";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";

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
  errors: DenseFieldErrorMap<UpdateInvoiceFieldNames>;
  pending: boolean;
}): JSX.Element {
  return (
    <div className="rounded-md bg-bg-secondary p-4 md:p-6">
      <InvoiceDate data-cy="date-input" defaultValue={currentInvoice.date} />

      {/*  TODO: Can I safely remove undefined from the error? */}
      <SensitiveData
        disabled={pending}
        error={errors.sensitiveData as FieldError | undefined}
      />

      <div className="mb-4">
        <Label htmlFor="customer" text="Choose customer" />
        <CustomerSelect
          customers={customers}
          dataCy="customer-select"
          defaultValue={currentInvoice.customerId}
          disabled={pending}
          error={errors.customerId as FieldError | undefined}
        />
      </div>

      <InvoiceAmountInput
        dataCy="amount-input"
        defaultValue={currentInvoice.amount / CENTS_IN_DOLLAR}
        disabled={pending}
        error={errors.amount as FieldError | undefined}
        id="amount"
        label="Choose an amount"
        name="amount"
      />

      <InvoiceStatusRadioGroup
        data-cy="invoice-status-radio-group"
        disabled={pending}
        error={errors.status as FieldError | undefined}
        name="status"
        value={currentInvoice.status}
      />
    </div>
  );
}

export const EditInvoiceForm = ({
  invoice,
  customers,
  errors: externalErrors,
}: {
  invoice: EditInvoiceViewModel; // fully populated for UI defaults
  customers: CustomerField[];
  errors?: DenseFieldErrorMap<UpdateInvoiceFieldNames>;
}): JSX.Element => {
  const initialState =
    buildInitialFailedFormStateFromSchema(UpdateInvoiceSchema);

  const [state, action, pending] = useActionState<
    FormState<UpdateInvoiceFieldNames, UpdateInvoiceInput>,
    FormData
  >(createWrappedUpdateAction(invoice.id), initialState);

  // Build a view-model for the UI:
  // - Before submit: use the provided invoice (required fields)
  // - After successful submit: merge the server-validated patch into the existing view
  const currentInvoice: EditInvoiceViewModel =
    state.success && state.data
      ? ({ ...invoice, ...state.data } as EditInvoiceViewModel)
      : invoice;

  const showAlert = useAutoHideAlert(
    state.message ? "do not keep this" : "this needs to be replace",
  );

  // Prefer externally provided dense errors; fall back to state (failure) errors or empty dense errors from initial state
  const denseErrors: DenseFieldErrorMap<UpdateInvoiceFieldNames> =
    externalErrors ??
    (state.success
      ? initialState.errors
      : (state.errors ?? initialState.errors));

  return (
    <div>
      <form action={action}>
        <FormFields
          currentInvoice={currentInvoice}
          customers={customers}
          errors={denseErrors}
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
