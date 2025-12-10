"use client";
import { type JSX, useActionState, useEffect, useId, useState } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import { getTodayIsoDate } from "@/modules/invoices/domain/date.utils";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceOutput,
  CreateInvoiceSchema,
} from "@/modules/invoices/domain/invoice.schema";
import { createInvoiceAction } from "@/modules/invoices/server/application/actions/create";
import { CustomerSelect } from "@/modules/invoices/ui/components/form/customer-select";
import { InvoiceAmountInput } from "@/modules/invoices/ui/components/form/invoice-amount-input";
import { InvoiceDate } from "@/modules/invoices/ui/components/form/invoice-date";
import { InvoiceServerMessage } from "@/modules/invoices/ui/components/form/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/modules/invoices/ui/components/form/invoice-status-radio-group";
import { SensitiveData } from "@/modules/invoices/ui/components/form/sensitive-data";
import { FormActionRow } from "@/shared/forms/components/form-action-row";
import { FormSubmitButton } from "@/shared/forms/components/form-submit-button";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/create-initial-form-state";
import type { FieldError } from "@/shared/forms/types/form.types";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { getFieldErrors } from "@/shared/forms/utilities/get-field-errors";
import { ALERT_AUTO_HIDE_MS } from "@/ui/styles/timings.tokens";

const INITIAL_STATE = createInitialFailedFormState<CreateInvoiceFieldNames>(
  Object.keys(CreateInvoiceSchema.shape) as readonly CreateInvoiceFieldNames[],
);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <TODO FIX LATER>
export const CreateInvoiceForm = ({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element => {
  const [state, action, pending] = useActionState<
    FormResult<CreateInvoiceOutput>,
    FormData
  >(createInvoiceAction, INITIAL_STATE);

  const [showAlert, setShowAlert] = useState(false);

  // Extract message from either success or error state
  const message = state.ok ? state.value.message : state.error.message;

  useEffect(() => {
    if (!message) {
      setShowAlert(false);
      return;
    }
    setShowAlert(true);
    const timer = setTimeout(() => setShowAlert(false), ALERT_AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message]);

  const dateId = useId();
  const amountId = useId();

  // Extract field errors from AppError metadata
  const fieldErrors = state.ok
    ? undefined
    : getFieldErrors<CreateInvoiceFieldNames>(state.error);

  return (
    <section>
      <form action={action}>
        <div className="space-y-6">
          <InvoiceDate
            data-cy="date-input"
            defaultValue={getTodayIsoDate()}
            disabled={pending}
            id={dateId}
            name="date"
          />

          <SensitiveData
            data-cy="sensitive-data-input"
            disabled={pending}
            error={fieldErrors?.sensitiveData as FieldError | undefined}
          />

          <CustomerSelect
            customers={customers}
            dataCy="customer-select"
            defaultValue=""
            disabled={pending}
            error={fieldErrors?.customerId as FieldError | undefined}
          />

          <InvoiceAmountInput
            dataCy="amount-input"
            disabled={pending}
            error={fieldErrors?.amount as FieldError | undefined}
            id={amountId}
            label="Choose an amount"
            name="amount"
            placeholder="Enter USD amount"
            step="0.01"
            type="number"
          />

          <InvoiceStatusRadioGroup
            data-cy="invoice-status-radio-group"
            disabled={pending}
            error={fieldErrors?.status as FieldError | undefined}
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
