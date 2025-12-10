"use client";
import { type JSX, useActionState, useId } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import {
  type EditInvoiceViewModel,
  type UpdateInvoiceFieldNames,
  type UpdateInvoiceOutput,
  UpdateInvoiceSchema,
} from "@/modules/invoices/domain/invoice.schema";
import { updateInvoiceAction } from "@/modules/invoices/server/application/actions/update";
import { CustomerSelect } from "@/modules/invoices/ui/components/form/customer-select";
import { InvoiceAmountInput } from "@/modules/invoices/ui/components/form/invoice-amount-input";
import { InvoiceDate } from "@/modules/invoices/ui/components/form/invoice-date";
import { InvoiceStatusRadioGroup } from "@/modules/invoices/ui/components/form/invoice-status-radio-group";
import { SensitiveData } from "@/modules/invoices/ui/components/form/sensitve-data";
import { useAutoHideAlert } from "@/modules/invoices/ui/hooks/useAutoHideAlert";
import { ServerMessage } from "@/modules/users/ui/components/server-message";
import { FormActionRow } from "@/shared/forms/components/form-action-row";
import { FormSubmitButton } from "@/shared/forms/components/form-submit-button";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/create-initial-form-state";
import type {
  DenseFieldErrorMap,
  FieldError,
} from "@/shared/forms/types/form.types";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { getFieldErrors } from "@/shared/forms/utilities/get-field-errors";
import { CENTS_IN_DOLLAR } from "@/shared/utilities/money/types";

// Helper: build the server action expected by useActionState
function createWrappedUpdateAction(invoiceId: string) {
  return async (
    prevState: FormResult<UpdateInvoiceOutput>,
    formData: FormData,
  ): Promise<FormResult<UpdateInvoiceOutput>> =>
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
  errors: DenseFieldErrorMap<UpdateInvoiceFieldNames, string>;
  pending: boolean;
}): JSX.Element {
  const invoiceAmountInputId = useId();
  return (
    <div className="rounded-md bg-bg-secondary p-4 md:p-6">
      <InvoiceDate data-cy="date-input" defaultValue={currentInvoice.date} />

      <SensitiveData
        disabled={pending}
        error={errors.sensitiveData as FieldError | undefined}
      />

      <CustomerSelect
        customers={customers}
        dataCy="customer-select"
        defaultValue={currentInvoice.customerId}
        disabled={pending}
        error={errors.customerId as FieldError | undefined}
      />

      <InvoiceAmountInput
        dataCy="amount-input"
        defaultValue={currentInvoice.amount / CENTS_IN_DOLLAR}
        disabled={pending}
        error={errors.amount as FieldError | undefined}
        id={invoiceAmountInputId}
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
  errors?: DenseFieldErrorMap<UpdateInvoiceFieldNames, string>;
}): JSX.Element => {
  const initialState = createInitialFailedFormState<UpdateInvoiceFieldNames>(
    Object.keys(
      UpdateInvoiceSchema.shape,
    ) as readonly UpdateInvoiceFieldNames[],
  );

  const [state, action, pending] = useActionState<
    FormResult<UpdateInvoiceOutput>,
    FormData
  >(createWrappedUpdateAction(invoice.id), initialState);
  // Build a view-model for the UI:
  // - Before submit: use the provided invoice (required fields)
  // - After successful submit: merge the server-validated patch into the existing view
  const currentInvoice: EditInvoiceViewModel =
    state.ok && state.value.data
      ? ({ ...invoice, ...state.value.data } as EditInvoiceViewModel)
      : invoice;

  // Extract message from either success or error state
  const message = state.ok ? state.value.message : state.error.message;

  const showAlert = useAutoHideAlert(message || "");

  // Extract field errors from AppError metadata
  const stateFieldErrors = state.ok
    ? undefined
    : getFieldErrors<UpdateInvoiceFieldNames>(state.error);

  // Prefer externally provided dense errors; fall back to state errors or empty from initial state
  const emptyErrors = initialState.ok
    ? undefined
    : getFieldErrors<UpdateInvoiceFieldNames>(initialState.error);

  const denseErrors: DenseFieldErrorMap<UpdateInvoiceFieldNames, string> =
    externalErrors ??
    stateFieldErrors ??
    emptyErrors ??
    ({} as DenseFieldErrorMap<UpdateInvoiceFieldNames, string>);

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
