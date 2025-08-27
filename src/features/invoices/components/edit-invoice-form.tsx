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
  BaseInvoiceFormFieldNames,
  BaseInvoiceFormFields,
  UpdateInvoiceFormFields,
} from "@/features/invoices/types";
import { ServerMessage } from "@/features/users/components/server-message";
import { updateInvoiceAction } from "@/server/invoices/actions/update";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";
import { Label } from "@/ui/primitives/label";

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

// Presentational: invoice form fields
function FormFields({
  currentInvoice,
  customers,
  errors,
  pending,
}: {
  currentInvoice: BaseInvoiceFormFields;
  customers: CustomerField[];
  errors: Partial<Record<BaseInvoiceFormFieldNames, FormFieldError>>;
  pending: boolean;
}): JSX.Element {
  return (
    <div className="rounded-md bg-bg-secondary p-4 md:p-6">
      <InvoiceDate defaultValue={currentInvoice.date} />

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
        // biome-ignore lint/style/noMagicNumbers: <basic math>
        defaultValue={currentInvoice.amount / 100}
        disabled={pending}
        error={errors?.amount as FormFieldError | undefined}
        id="amount"
        label="Choose an amount"
        name="amount"
      />

      <InvoiceStatusRadioGroup
        data-cy="status-radio"
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
