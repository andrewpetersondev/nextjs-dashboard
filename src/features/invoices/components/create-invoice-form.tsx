"use client";
import { type JSX, useActionState, useEffect, useId, useState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceServerMessage } from "@/features/invoices/components/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceOutput,
  CreateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import { createInvoiceAction } from "@/server/invoices/actions/create";
import type { FieldError } from "@/shared/forms/domain/field-error.types";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/initial-state";
import { getFieldErrors } from "@/shared/forms/use-cases/field-errors.extractor";
import { ALERT_AUTO_HIDE_MS } from "@/shared/ui/timings.tokens";
import { getTodayIsoDate } from "@/shared/utils/date/format";
import { Label } from "@/ui/atoms/label";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";

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
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
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

          <div className="mb-4">
            <Label htmlFor="customerId" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue=""
              disabled={pending}
              error={fieldErrors?.customerId as FieldError | undefined}
            />
          </div>

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
