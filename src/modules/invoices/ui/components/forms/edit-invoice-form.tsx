"use client";

import { type JSX, useActionState, useId } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import {
  type EditInvoiceViewModel,
  type UpdateInvoiceFieldNames,
  type UpdateInvoicePayload,
  UpdateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { updateInvoiceAction } from "@/modules/invoices/server/application/actions/update-invoice.action";
import { CustomerSelect } from "@/modules/invoices/ui/components/forms/customer-select";
import { InvoiceAmountInput } from "@/modules/invoices/ui/components/forms/invoice-amount-input";
import { InvoiceDate } from "@/modules/invoices/ui/components/forms/invoice-date";
import { InvoiceStatusRadioGroup } from "@/modules/invoices/ui/components/forms/invoice-status-radio-group";
import { SensitiveData } from "@/modules/invoices/ui/components/forms/sensitive-data";
import type {
  DenseFieldErrorMap,
  FieldError,
} from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeInitialFailedFormState } from "@/shared/forms/logic/factories/form-state.factory";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { FormActionRow } from "@/shared/forms/ui/components/form-action-row";
import { ROUTES } from "@/shared/routes/routes";
import { CENTS_IN_DOLLAR } from "@/shared/utilities/money/types";
import { useAutoHideAlert } from "@/ui/hooks/useAutoHideAlert";
import { ServerMessage } from "@/ui/molecules/server-message";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

// Helper: build the server action expected by useActionState
function createWrappedUpdateAction(invoiceId: string) {
  return async (
    prevState: FormResult<UpdateInvoicePayload>,
    formData: FormData,
  ): Promise<FormResult<UpdateInvoicePayload>> =>
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
    <div className="space-y-6">
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
  const initialState = makeInitialFailedFormState<UpdateInvoiceFieldNames>(
    Object.keys(
      UpdateInvoiceSchema.shape,
    ) as readonly UpdateInvoiceFieldNames[],
  );

  const [state, action, pending] = useActionState<
    FormResult<UpdateInvoicePayload>,
    FormData
  >(createWrappedUpdateAction(invoice.id), initialState);
  const currentInvoice: EditInvoiceViewModel =
    state.ok && state.value.data
      ? ({ ...invoice, ...state.value.data } as EditInvoiceViewModel)
      : invoice;

  const message = state.ok ? state.value.message : state.error.message;

  const showAlert = useAutoHideAlert(message || "");

  const stateFieldErrors = state.ok
    ? undefined
    : extractFieldErrors<UpdateInvoiceFieldNames>(state.error);

  const emptyErrors = initialState.ok
    ? undefined
    : extractFieldErrors<UpdateInvoiceFieldNames>(initialState.error);

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
        <FormActionRow cancelHref={ROUTES.dashboard.invoices}>
          <SubmitButtonMolecule
            data-cy="edit-invoice-submit-button"
            label="Edit Invoice"
            pending={pending}
          />
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
};
